"use client";

import { TableIcon } from "@/components/icons/table-icon";
import { AnimatedSizeContainer } from "@/components/mango-ui/animated-size-container";
import { Modal } from "@/components/mango-ui/mango-modal";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import {
	type Dispatch,
	type SetStateAction,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	type Control,
	type UseFormSetValue,
	type UseFormWatch,
	useForm,
} from "react-hook-form";
import { toast } from "sonner";
import { FieldMapping } from "./field-mapping";
import { SelectFile } from "./select-file";

export const mappableFields = {
	campaign_name: {
		label: "Campaign Name",
		required: true,
	},
	product_name: {
		label: "Product Name",
		required: true,
	},
	product_description: {
		label: "Product Description",
		required: true,
	},
	product_price: {
		label: "Product Price",
		required: true,
	},
	product_price_type: {
		label: "Product Price Type",
		required: false,
	},
	affiliate_count: {
		label: "Affiliate Count",
		required: false,
	},
	location: {
		label: "Location",
		required: false,
	},
	lead: {
		label: "Lead",
		required: false,
	},
	click: {
		label: "Click",
		required: false,
	},
	sale: {
		label: "Sale",
		required: false,
	},
} as const;

export type ImportCsvFormData = {
	file: File | null;
} & Record<keyof typeof mappableFields, string>;

const ImportCsvContext = createContext<{
	fileColumns: string[] | null;
	setFileColumns: (columns: string[] | null) => void;
	firstRows: Record<string, string>[] | null;
	setFirstRows: (rows: Record<string, string>[] | null) => void;
	control: Control<ImportCsvFormData>;
	watch: UseFormWatch<ImportCsvFormData>;
	setValue: UseFormSetValue<ImportCsvFormData>;
	plan: string | null;
	setPlan: Dispatch<SetStateAction<string | null>>;
	userId: string | null;
	setUserId: Dispatch<SetStateAction<string | null>>;
} | null>(null);

export function useCsvContext() {
	const context = useContext(ImportCsvContext);
	if (!context)
		throw new Error(
			"useCsvContext must be used within an ImportCsvContext.Provider",
		);

	return context;
}

const pages = ["select-file", "confirm-import"] as const;

function ImportCsvModal({
	showImportCsvModal,
	setShowImportCsvModal,
	plan,
	setPlan,
	userId,
	setUserId,
}: {
	showImportCsvModal: boolean;
	setShowImportCsvModal: Dispatch<SetStateAction<boolean>>;
	plan: string | null;
	setPlan: Dispatch<SetStateAction<string | null>>;
	userId: string | null;
	setUserId: Dispatch<SetStateAction<string | null>>;
}) {
	const {
		control,
		watch,
		setValue,
		handleSubmit,
		reset,
		formState: { isValid },
	} = useForm<ImportCsvFormData>({
		defaultValues: {},
	});

	const [pageNumber, setPageNumber] = useState<number>(0);
	const page = pages[pageNumber];

	const [fileColumns, setFileColumns] = useState<string[] | null>(null);
	const [firstRows, setFirstRows] = useState<Record<string, string>[] | null>(
		null,
	);

	const file = watch("file");

	// Go to second page if file looks good
	useEffect(() => {
		if (file && fileColumns && pageNumber === 0) {
			setPageNumber(1);
		}
	}, [file, fileColumns, pageNumber]);

	return (
		<Modal
			showModal={showImportCsvModal}
			setShowModal={setShowImportCsvModal}
			className="max-h-[95dvh] max-w-lg"
		>
			<div className="flex flex-col items-center justify-center space-y-3 border-b border-neutral-200 px-4 py-8 sm:px-16">
				<div className="flex items-center gap-x-3 py-4">
					<div className="flex size-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
						<TableIcon className="size-5" />
					</div>
				</div>
				<h3 className="text-lg font-medium">
					Import Campaigns From a CSV File
				</h3>
				<p className="text-balance text-center text-sm text-neutral-500">
					Easily import your campaigns into mangosqueezy with just a few clicks.
					<br />
					Make sure your CSV file matches the{" "}
					<a
						href="https://tide-raft-c4a.notion.site/How-to-import-campaign-from-a-CSV-file-611362682c4847ba8b59e69d4fbaf6a5"
						target="_blank"
						className="cursor-help font-medium underline decoration-dotted underline-offset-2 transition-colors hover:text-neutral-800"
						rel="noreferrer"
					>
						required format
					</a>
					.
				</p>
			</div>

			<div className="relative">
				{page === "confirm-import" && (
					<div className="absolute inset-x-0 -top-6 mx-4 grid grid-cols-[1fr_min-content_1fr] items-center gap-x-4 gap-y-2 rounded-md border border-neutral-200 bg-white p-2 text-center text-sm font-medium uppercase text-neutral-600 sm:mx-12">
						<p>CSV data column</p>
						<ArrowRight className="size-4 text-neutral-500" />
						<p>Dub data field</p>
					</div>
				)}

				<AnimatedSizeContainer height>
					<ImportCsvContext.Provider
						value={{
							fileColumns,
							setFileColumns,
							firstRows,
							setFirstRows,
							control,
							watch,
							setValue,
							plan,
							setPlan,
							userId,
							setUserId,
						}}
					>
						<div className="flex flex-col gap-y-6 bg-neutral-50 px-4 py-8 text-left sm:px-12">
							<form
								// biome-ignore lint/suspicious/noExplicitAny:
								onSubmit={handleSubmit(async (data: any) => {
									const loadingId = toast.loading(
										"Adding campaigns to import queue...",
									);
									try {
										const formData = new FormData();
										formData.append("file", data.file!);
										formData.append("userId", userId!);
										for (const key in data) {
											if (key !== "file" && data[key] !== null) {
												formData.append(key, data[key]);
											}
										}

										const res = await fetch(
											"https://www.mangosqueezy.com/api/import/csv",
											{
												method: "POST",
												body: formData,
											},
										);

										if (!res.ok) throw new Error();

										toast.success(
											"Successfully added campaigns to import queue! You can now safely navigate from this tab – we will send you an email when your campaigns have been fully imported.",
										);
									} catch (error) {
										toast.error("Error adding campaigns to import queue");
									} finally {
										toast.dismiss(loadingId);
									}
								})}
								className="flex flex-col gap-y-4"
							>
								{page === "select-file" && <SelectFile plan={plan ?? ""} />}

								{page === "confirm-import" && (
									<>
										<FieldMapping />
										<Button variant="default" disabled={!isValid} type="submit">
											Confirm import
										</Button>
										<button
											type="button"
											className="-mt-1 text-center text-xs text-neutral-600 underline underline-offset-2 transition-colors hover:text-neutral-800"
											onClick={() => {
												setPageNumber(0);
												reset();
												setFileColumns(null);
												setFirstRows(null);
											}}
										>
											Choose another file
										</button>
									</>
								)}
							</form>
						</div>
					</ImportCsvContext.Provider>
				</AnimatedSizeContainer>
			</div>
		</Modal>
	);
}

export function useImportCsvModal() {
	const [showImportCsvModal, setShowImportCsvModal] = useState(false);
	const [plan, setPlan] = useState<string | null>(null);
	const [userId, setUserId] = useState<string | null>(null);
	const ImportCsvModalCallback = useCallback(() => {
		return (
			<ImportCsvModal
				showImportCsvModal={showImportCsvModal}
				setShowImportCsvModal={setShowImportCsvModal}
				plan={plan}
				setPlan={setPlan}
				userId={userId}
				setUserId={setUserId}
			/>
		);
	}, [showImportCsvModal, plan, userId]);

	return useMemo(
		() => ({
			setShowImportCsvModal,
			ImportCsvModal: ImportCsvModalCallback,
			setPlan,
			setUserId,
		}),
		[ImportCsvModalCallback],
	);
}
