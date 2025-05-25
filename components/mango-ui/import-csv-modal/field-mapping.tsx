"use client";

import { Button } from "@/components/mango-ui/import-csv-modal/import-button";
import { Popover } from "@/components/mango-ui/import-csv-modal/import-csv-popover";
import { generateCsvMapping } from "@/lib/ai/generate-csv-mapping";
import { cn } from "@/lib/utils";
import { readStreamableValue } from "ai/rsc";
import { Check, Loader, TableIcon, XIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { mappableFields, useCsvContext } from ".";
import { IconMenu } from "./icon-menu";

export function FieldMapping() {
	const { fileColumns, firstRows, setValue } = useCsvContext();

	const [isStreaming, setIsStreaming] = useState(true);

	useEffect(() => {
		if (!fileColumns || !firstRows) return;

		generateCsvMapping(fileColumns, firstRows)
			.then(async ({ object }) => {
				setIsStreaming(true);
				for await (const partialObject of readStreamableValue(object)) {
					if (partialObject) {
						for (const entry of Object.entries(partialObject)) {
							const [field, value] = entry as string[];
							if (
								Object.keys(mappableFields).includes(field) &&
								fileColumns.includes(value)
							) {
								setValue(field as keyof typeof mappableFields, value, {
									shouldValidate: true,
								});
							}
						}
					}
				}
			})
			.finally(() => setIsStreaming(false));
	}, [fileColumns, firstRows, setValue]);

	return (
		<div className="grid grid-cols-[1fr_min-content_1fr] gap-x-4 gap-y-2">
			{(Object.keys(mappableFields) as (keyof typeof mappableFields)[]).map(
				(field) => (
					<FieldRow key={field} field={field} isStreaming={isStreaming} />
				),
			)}
		</div>
	);
}

function FieldRow({
	field,
	isStreaming,
}: {
	field: keyof typeof mappableFields;
	isStreaming: boolean;
}) {
	const { label, required } = mappableFields[field];

	const { control, watch, fileColumns, firstRows } = useCsvContext();

	const value = watch(field);

	const isLoading = isStreaming && !value;
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<div className="relative flex min-w-0 items-center gap-2">
				<Controller
					control={control}
					name={field}
					rules={{ required }}
					render={({ field }) => (
						<Popover
							align="end"
							content={
								<div className="w-full p-2 md:w-48">
									{[
										...(fileColumns || []),
										...(field.value && !required ? ["None"] : []),
									]?.map((column) => {
										const Icon = column !== "None" ? TableIcon : XIcon;
										return (
											<button
												type="button"
												key={column}
												onClick={() => {
													field.onChange(column !== "None" ? column : null);
													setIsOpen(false);
												}}
												className={cn(
													"flex w-full items-center justify-between space-x-2 rounded-md px-1 py-2 hover:bg-neutral-100 active:bg-neutral-200",
													column === "None" && "text-neutral-400",
												)}
											>
												<IconMenu
													text={column}
													icon={<Icon className="w-4 h-4 flex-none" />}
												/>
												{field.value === column && (
													<Check className="w-4 shrink-0" />
												)}
											</button>
										);
									})}
								</div>
							}
							openPopover={isOpen}
							setOpenPopover={setIsOpen}
						>
							<Button
								variant="secondary"
								className="h-9 min-w-0 px-3"
								textWrapperClassName="grow text-left"
								onClick={() => setIsOpen((o) => !o)}
								disabled={isLoading}
								text={
									<div className="flex w-full grow items-center justify-between gap-1">
										<span className="flex-1 truncate whitespace-nowrap text-left text-gray-800">
											{field.value || (
												<span className="text-gray-600">Select column...</span>
											)}
										</span>
										{isLoading ? (
											<Loader className="w-4 h-4 shrink-0" />
										) : (
											<ChevronDown className="w-4 h-4 shrink-0 text-gray-400 transition-transform duration-75 group-data-[state=open]:rotate-180" />
										)}
									</div>
								}
							/>
						</Popover>
					)}
				/>
			</div>
			<div className="flex items-center justify-end" />

			<span className="flex h-9 items-center gap-1 rounded-md border border-neutral-200 bg-neutral-100 px-3">
				<span className="grow whitespace-nowrap text-sm font-normal text-neutral-700">
					{label} {required && <span className="text-red-700">*</span>}
				</span>
			</span>
		</>
	);
}
