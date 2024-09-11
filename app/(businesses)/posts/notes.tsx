"use client";

import { CustomToast } from "@/components/mango-ui/custom-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { classNames } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
	Label,
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from "@headlessui/react";
import type { Products } from "@prisma/client";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { createPostAction } from "./actions";

type TNotesProps = {
	products: Array<Products> | null | undefined;
	business_id: string | null | undefined;
};

export default function Notes({ products, business_id }: TNotesProps) {
	const [product, setProduct] = useState(products ? products[0] : null);
	const [description, setDescription] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const postHandler = async () => {
		setIsLoading(true);
		const result = await createPostAction(
			product?.id!,
			description,
			business_id!,
		);
		if (result?.id) {
			toast.custom((t) => (
				<CustomToast
					t={t}
					message="Post sent successfully."
					variant="success"
				/>
			));
		}
		setIsLoading(false);
		setDescription("");
	};

	return (
		<>
			<Toaster position="top-right" />

			<div className="flex items-center justify-center">
				<Alert className="bg-orange-50">
					<AlertTitle>Heads up!</AlertTitle>
					<AlertDescription className="text-orange-700">
						{`It's an automated process where the system helps you connect with affiliates, create affiliate links, and share them.
					If you want manual control go to `}
						<Link
							href="/affiliate"
							className="font-semibold text-blue-500 underline decoration-blue-500"
						>
							Affiliate
						</Link>
						{" section."}
					</AlertDescription>
				</Alert>
			</div>

			<div className="relative">
				<div className="overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
					<label htmlFor="description" className="sr-only">
						Note
					</label>
					<textarea
						id="description"
						name="description"
						rows={2}
						value={description}
						placeholder="Write a note..."
						className="block w-full resize-none border-0 py-0 mt-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
						onChange={(e) => setDescription(e.target.value)}
					/>

					{/* Spacer element to match the height of the toolbar */}
					<div aria-hidden="true">
						<div className="py-2">
							<div className="h-9" />
						</div>
						<div className="h-px" />
						<div className="py-2">
							<div className="py-px">
								<div className="h-9" />
							</div>
						</div>
					</div>
				</div>

				<div className="absolute inset-x-px bottom-0">
					{products?.length ? (
						<div className="flex flex-nowrap justify-end space-x-2 px-2 py-2 sm:px-3">
							<Listbox
								as="div"
								value={product}
								onChange={setProduct}
								className="flex-shrink-0"
							>
								<Label className="sr-only">Assign</Label>
								<div className="relative">
									<ListboxButton className="relative inline-flex items-center whitespace-nowrap rounded-full bg-gray-50 px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 sm:px-3">
										<span
											className={classNames(
												product?.id === null ? "" : "text-gray-900",
												"hidden truncate sm:ml-2 sm:block",
											)}
										>
											{product?.id === null ? "Assign" : product?.name}
										</span>
									</ListboxButton>

									<ListboxOptions
										transition
										className="absolute right-0 z-10 mt-1 max-h-56 w-52 overflow-auto rounded-lg bg-white py-3 text-base shadow ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
									>
										{products
											? products.map((product) => (
													<ListboxOption
														key={product.id}
														value={product}
														className="relative cursor-default select-none bg-white px-3 py-2 data-[focus]:bg-gray-100"
													>
														<div className="flex items-center">
															<span className="ml-3 block truncate font-medium">
																{product.name}
															</span>
														</div>
													</ListboxOption>
												))
											: null}
									</ListboxOptions>
								</div>
							</Listbox>
						</div>
					) : (
						<Link
							href="/products"
							className="inline-flex justify-end text-blue-500 gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50"
						>
							Add a product
						</Link>
					)}

					<div className="flex items-center justify-between space-x-3 border-t border-gray-200 px-2 py-2 sm:px-3">
						<div className="flex-shrink-0">
							<button
								type="button"
								disabled={isLoading || !products?.length}
								onClick={postHandler}
								className={cn(
									"inline-flex justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
									isLoading || (!products?.length && "cursor-not-allowed"),
								)}
							>
								{isLoading && (
									<Loader className="-ml-0.5 h-5 w-5 text-gray-400 animate-spin" />
								)}
								Create
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
