import { hasFeatureAccess, truncate } from "@/lib/utils";
import { Loader } from "lucide-react";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { useCsvContext } from ".";
import { FileUpload } from "./file-upload";

const MAX_ROWS_LIMIT = 10000;

export function SelectFile({ plan }: { plan: string }) {
	const { watch, control, fileColumns, setFileColumns, setFirstRows } =
		useCsvContext();

	const file = watch("file");
	const [error, setError] = useState<string | null>(null);
	const [isCountingRows, setIsCountingRows] = useState<boolean>(false);

	useEffect(() => {
		if (!file) {
			setFileColumns(null);
			return;
		}

		setIsCountingRows(true);
		countCsvRows(file)
			.then((rowCount) => {
				const programLimit = hasFeatureAccess(
					plan,
					"Features",
					"Programs",
				) as number;

				if (rowCount >= programLimit) {
					setError(
						"You have reached the maximum number of affiliates programs.",
					);
					setFileColumns(null);
					setFirstRows(null);
					return;
				}

				if (rowCount > MAX_ROWS_LIMIT) {
					setError(
						"CSV file exceeds the maximum limit of 50,000 rows. Please split the file into multiple files and upload them separately.",
					);
					setFileColumns(null);
					setFirstRows(null);
					return;
				}

				return readLines(file, programLimit).then((lines) => {
					const { data, meta } = Papa.parse(lines, {
						worker: false,
						skipEmptyLines: true,
						header: true,
					});

					if (!data || data.length < 1) {
						setError("CSV file must have at least 1 row.");
						setFileColumns(null);
						setFirstRows(null);
						return;
					}

					if (!meta || !meta.fields || meta.fields.length <= 1) {
						setError("Failed to retrieve CSV column data.");
						setFileColumns(null);
						setFirstRows(null);
						return;
					}

					setFileColumns(meta.fields);
					setFirstRows(data as Record<string, string>[]);
				});
			})
			.catch(() => {
				setError("Failed to read CSV file.");
				setFileColumns(null);
				setFirstRows(null);
			})
			.finally(() => {
				setIsCountingRows(false);
			});
	}, [file, setFileColumns, setFirstRows, plan]);

	return (
		<div className="flex flex-col gap-3">
			<Controller
				name="file"
				control={control}
				render={({ field: { value, onChange } }) => {
					return (
						<FileUpload
							accept="csv"
							maxFileSizeMB={1024}
							onChange={({ file }) => onChange(file)}
							content={
								value
									? truncate(value.name, 25)
									: "Click or drag and drop a CSV file."
							}
							className="aspect-auto h-24"
							iconClassName="size-6"
						/>
					);
				}}
			/>
			{error ? (
				<p className="text-center text-sm text-red-600">{error}</p>
			) : fileColumns ? (
				<p className="text-sm text-neutral-600">
					Columns found: {listColumns(fileColumns)}
				</p>
			) : file ? (
				<div className="flex items-center justify-center">
					<Loader />
					{isCountingRows && (
						<p className="ml-2 text-sm text-neutral-600">
							Validating file size...
						</p>
					)}
				</div>
			) : null}
		</div>
	);
}

const maxColumns = 4;

const listColumns = (columns: string[]) => {
	const eachTruncated = columns.map((column) => truncate(column, 16));
	const allTruncated =
		eachTruncated.length <= maxColumns
			? eachTruncated
			: eachTruncated
					.slice(0, maxColumns)
					.concat(`and ${eachTruncated.length - maxColumns} more`);
	return allTruncated.join(", ");
};

const countCsvRows = async (file: File): Promise<number> => {
	return new Promise((resolve, reject) => {
		let rowCount = 0;

		Papa.parse(file, {
			worker: true,
			skipEmptyLines: true,
			step: () => {
				rowCount++;
			},
			complete: () => {
				resolve(rowCount);
			},
			error: (error) => {
				reject(error);
			},
		});
	});
};

const readLines = async (file: File, count = 4): Promise<string> => {
	const reader = file.stream().getReader();
	const decoder = new TextDecoder("utf-8");
	let { value: chunk, done: readerDone } = await reader.read();
	let content = "";
	const result: string[] = [];
	while (!readerDone) {
		content += decoder.decode(chunk, { stream: true });
		const lines = content.split("\n");
		if (lines.length >= count) {
			reader.cancel();
			return lines.slice(0, count).join("\n");
		}
		({ value: chunk, done: readerDone } = await reader.read());
	}
	return result.join("\n");
};
