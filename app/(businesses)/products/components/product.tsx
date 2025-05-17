"use client";
import { CustomToast } from "@/components/mango-ui/custom-toast";
import { Editor } from "@/components/mango-ui/editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useJune } from "@/hooks/useJune";
import { hasFeatureAccess } from "@/lib/utils";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Business, Products } from "@prisma/client";
import { Loader2, MoreHorizontal, PlusCircle } from "lucide-react";
import { useActionState, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster, type Toast } from "react-hot-toast";
import { z } from "zod";
import {
	createProductAction,
	deleteProductAction,
	updateProductAction,
} from "../actions";

const defaultContent = "";

enum PriceType {
	Subscription = "Subscription",
	OneTime = "OneTime",
}

const FormSchema = z.object({
	name: z.string().min(1, {
		message: "Please enter the name.",
	}),
	price: z.string().min(1, {
		message: "Please enter the price.",
	}),
	description: z.string().min(1, {
		message: "Please enter the description.",
	}),
	htmlDescription: z.string().nullable(),
	priceType: z.nativeEnum(PriceType),
	isShippable: z.boolean(),
	picture: z
		.object({
			name: z.string().min(1, {
				message: "Please upload the photo.",
			}),
			fileDetails: z.string().min(1, {
				message: "Please upload the photo.",
			}),
			url: z.string().min(1, {
				message: "Please upload the photo.",
			}),
		})
		.refine((data) => !!data.name && !!data.fileDetails && !!data.url, {
			message: "Please upload the picture.",
		}),
});

export type TBusiness = Pick<
	Business,
	"id" | "stripe_customer_id" | "stripe_subscription_id"
> & {
	products: Array<Products>;
};

export type TPictureInfo = {
	name: string;
	fileDetails: string;
	url: string;
};

const initialStateSchema = z.object({
	success: z.string(),
	errors: z.object({
		message: z.string().nullable(),
		name: z.string().nullable(),
		price: z.string().nullable(),
		description: z.string().nullable(),
		htmlDescription: z.string().nullable(),
		productImage: z.string().nullable(),
		priceType: z.nativeEnum(PriceType).nullable(),
		isShippable: z.boolean().nullable(),
	}),
});

// Infer the TypeScript type from the Zod schema
export type TFormInitialState = z.infer<typeof initialStateSchema>;

// The initial state object, matching the schema
const initialState: TFormInitialState = {
	success: "",
	errors: {
		message: null,
		name: null,
		price: null,
		description: null,
		productImage: null,
		htmlDescription: null,
		priceType: null,
		isShippable: null,
	},
};

export default function Product({
	user,
	productCount,
	plan,
}: {
	user: TBusiness | null | undefined;
	productCount: number;
	plan: string;
}) {
	const analytics = useJune(process.env.NEXT_PUBLIC_JUNE_API_KEY!);
	const [open, setOpen] = useState(false);
	const [updateFormState, updateAction, isPendingUpdate] = useActionState(
		updateProductAction,
		initialState,
	);
	const [deleteFormState, deleteAction, isPendingDelete] = useActionState(
		deleteProductAction,
		initialState,
	);
	const [editProductInfo, setEditProductInfo] = useState({
		id: 0,
		name: "",
		price: "",
		description: "",
		htmlDescription: "",
		imageUrl: "",
		priceType: PriceType.OneTime,
		isShippable: true,
	});
	const [isPending, startTransition] = useTransition();
	const [isSaving, setIsSaving] = useState(false);
	const [openEditProductDialog, setOpenEditProductDialog] = useState(false);
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			name: "",
			price: "",
			description: "",
			htmlDescription: "",
			picture: {
				name: "",
				fileDetails: "",
				url: "",
			},
			priceType: PriceType.OneTime,
			isShippable: true,
		},
	});

	const openSheetHandler = (flag: boolean) => {
		const productLimit = hasFeatureAccess(
			plan,
			"Features",
			"Products",
		) as number;

		if (productCount >= productLimit) {
			toast("You have reached the maximum number of products.");
			return;
		}
		setOpen(flag);
	};

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		setIsSaving(true);
		const formData = new FormData();
		formData.append("name", data.name);
		formData.append("price", data.price);
		formData.append("description", data.description || "");
		formData.append("html-description", data.htmlDescription || "");
		formData.append("image-reference-file", data.picture.fileDetails);
		formData.append("image-reference-file-name", data.picture.name);
		formData.append("business-id", user?.id as string);
		formData.append("price-type", data.priceType);
		formData.append("is-shippable", data.isShippable.toString());

		const result = await createProductAction(formData);
		if (result === "success") {
			toast.success("Successfully added product.");
			analytics?.track("product_created", {
				business_id: user?.id,
				name: data.name,
				price: data.price,
				description: data.description,
			});
			setOpen(false);
		} else if (result === "error") {
			toast.error("Something went wrong please try again later");
		}
		setIsSaving(false);
	}

	useEffect(() => {
		if (
			updateFormState?.success === "updated successfully" &&
			!isPendingUpdate &&
			!isPending
		) {
			toast.custom((t: Toast) => (
				<CustomToast
					t={t}
					message="Product updated successfully!"
					variant="success"
				/>
			));
			updateFormState.success = "";
		} else if (
			deleteFormState?.success === "deleted successfully" &&
			!isPendingDelete &&
			!isPending
		) {
			toast.custom((t: Toast) => (
				<CustomToast
					t={t}
					message="Product deleted successfully!"
					variant="success"
				/>
			));
			deleteFormState.success = "";
		} else if (
			updateFormState?.errors?.message ||
			deleteFormState?.errors?.message
		) {
			toast.custom((t: Toast) => (
				<CustomToast
					t={t}
					message="Something went wrong. Please try again later!"
					variant="error"
				/>
			));
			updateFormState.errors.message = "";
			deleteFormState.errors.message = "";
		}
	}, [
		updateFormState,
		deleteFormState,
		isPendingUpdate,
		isPendingDelete,
		isPending,
	]);

	const uploadProductPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
		const reader = new FileReader();
		reader.onload = async () => {
			/* Base64 is a binary-to-text encoding scheme used to
          transport data. The encoding is necessary when the transfer
          medium is not able to handle binary data.
          This binary data is then translated to a text representation (base64) and transferred as text. */

			// base64 is an algorithm for encoding and decoding an object to ASCII format.
			const base64String: string = reader?.result as string;

			const pictureInfo = {
				name: event.target.files?.[0].name,
				fileDetails: base64String.split(",")[1],
				url: base64String,
			};

			form.clearErrors("picture");
			form.setValue("picture", pictureInfo as TPictureInfo);
		};

		reader.readAsDataURL(event.target.files?.[0] as File);
	};

	const updateDescription = (htmlContent: string, text: string) => {
		form.setValue("description", text);
		form.setValue("htmlDescription", htmlContent);
	};

	return (
		<>
			<Toaster position="top-right" />

			<div className="flex min-h-screen w-full flex-col">
				<div className="ml-auto flex items-center gap-2 mb-5">
					<Sheet open={open} onOpenChange={openSheetHandler}>
						<SheetTrigger asChild>
							<Button size="sm" className="h-8 gap-1">
								<PlusCircle className="h-3.5 w-3.5" />
								<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
									Add Product
								</span>
							</Button>
						</SheetTrigger>
						<SheetContent className="px-3">
							<ScrollArea className="h-96 md:h-full">
								<Form {...form}>
									<form onSubmit={form.handleSubmit(onSubmit)}>
										<SheetHeader>
											<SheetTitle>Product details</SheetTitle>
											<SheetDescription>
												{`Add product details. Click save when you're done.`}
											</SheetDescription>
										</SheetHeader>
										<div className="grid gap-4 py-4">
											<div>
												<FormField
													control={form.control}
													name="name"
													render={({ field }) => (
														<>
															<FormItem>
																<FormLabel className="truncate text-black">
																	Name
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="mangosqueezy"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														</>
													)}
												/>
											</div>
											<div>
												<FormField
													control={form.control}
													name="price"
													render={({ field }) => (
														<>
															<FormItem>
																<FormLabel className="truncate text-black">
																	Price
																</FormLabel>
																<FormControl>
																	<Input placeholder="0.00" {...field} />
																</FormControl>
																<FormMessage />
															</FormItem>
														</>
													)}
												/>
											</div>
											<div>
												<FormField
													control={form.control}
													name="priceType"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Price Type</FormLabel>
															<Select
																onValueChange={field.onChange}
																defaultValue={field.value as PriceType}
															>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Select a price type" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	<SelectItem value={PriceType.OneTime}>
																		{PriceType.OneTime}
																	</SelectItem>
																	<SelectItem value={PriceType.Subscription}>
																		{PriceType.Subscription}
																	</SelectItem>
																</SelectContent>
															</Select>
															<FormDescription>
																Select the price type for the product.
															</FormDescription>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
											<div>
												<FormField
													control={form.control}
													name="description"
													render={() => (
														<>
															<FormItem>
																<FormLabel className="truncate text-black">
																	Description
																</FormLabel>
																<FormControl>
																	<ScrollArea className="h-72 text-sm rounded-md border">
																		<Editor
																			content={defaultContent}
																			updateDescription={updateDescription}
																		/>
																	</ScrollArea>
																</FormControl>
																<FormMessage />
															</FormItem>
														</>
													)}
												/>
											</div>
											<div>
												<FormField
													control={form.control}
													name="isShippable"
													render={({ field }) => (
														<>
															<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
																<FormControl>
																	<Checkbox
																		checked={field.value}
																		onCheckedChange={field.onChange}
																	/>
																</FormControl>
																<div className="space-y-1 leading-none">
																	<FormLabel>Is Shippable</FormLabel>
																	<FormDescription>
																		Do you want to collect a shipping address
																		from the customer?
																	</FormDescription>
																</div>
																<FormMessage />
															</FormItem>
														</>
													)}
												/>
											</div>
											<div>
												<FormField
													control={form.control}
													name="picture"
													render={() => (
														<>
															<FormItem>
																<FormLabel className="truncate text-black">
																	Front Picture
																</FormLabel>

																<FormControl>
																	<Input
																		id="picture"
																		type="file"
																		onChange={(event) => {
																			uploadProductPhoto(event);
																		}}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														</>
													)}
												/>
											</div>
										</div>
										<SheetFooter>
											<Button type="submit" disabled={isSaving}>
												{isSaving ? (
													<>
														<span className="mr-2">Saving...</span>
														<Loader2 className="h-4 w-4 animate-spin" />
													</>
												) : (
													"Save changes"
												)}
											</Button>
										</SheetFooter>
									</form>
								</Form>
							</ScrollArea>
						</SheetContent>
					</Sheet>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Products</CardTitle>
						<CardDescription>Manage your products.</CardDescription>
					</CardHeader>
					<CardContent>
						{user?.products.length === 0 ? (
							<div className="text-center text-gray-500">No data available</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Description</TableHead>
										<TableHead className="hidden md:table-cell">
											Price
										</TableHead>
										<TableHead className="hidden md:table-cell">
											Image Url
										</TableHead>
										<TableHead>
											<span className="sr-only">Actions</span>
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{user?.products.map((product: Products) => (
										<TableRow key={product.id}>
											<TableCell className="font-medium">
												{product.name}
											</TableCell>
											<TableCell className="font-medium">
												<Badge variant="outline" className="text-green-500">
													{product.status}
												</Badge>
											</TableCell>
											<TableCell>
												<Editor
													content={product.html_description as string}
													disabled={true}
												/>
											</TableCell>
											<TableCell className="hidden md:table-cell">
												{product.price}
											</TableCell>
											<TableCell className="hidden md:table-cell">
												<a
													href={product.image_url || ""}
													className="text-orange-500 flex"
													target="_blank"
													rel="noreferrer"
												>
													product image
													<ArrowTopRightOnSquareIcon className="ml-2 h-5 w-5" />
												</a>
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															aria-haspopup="true"
															size="icon"
															variant="ghost"
														>
															<MoreHorizontal className="h-4 w-4" />
															<span className="sr-only">Toggle menu</span>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end" className="bg-white">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuItem
															onClick={() => {
																setEditProductInfo({
																	id: product.id,
																	name: product.name,
																	description: product.description,
																	htmlDescription:
																		product.html_description || "",
																	price: product.price.toString(),
																	imageUrl: product.image_url || "",
																	priceType: product.price_type as PriceType,
																	isShippable: product.is_shippable ?? true,
																});
																setOpenEditProductDialog(true);
															}}
														>
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={async () => {
																const formData = new FormData();
																formData.append(
																	"product-id",
																	product.id.toString(),
																);
																startTransition(async () => {
																	await deleteAction(formData);
																});
															}}
														>
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>

			<Dialog
				open={openEditProductDialog}
				onOpenChange={() => setOpenEditProductDialog(!openEditProductDialog)}
			>
				<DialogContent className="sm:max-w-[425px]">
					<ScrollArea className="h-96 md:h-full">
						<DialogHeader>
							<DialogTitle>Edit profile</DialogTitle>
							<DialogDescription>
								{`Make changes to your profile here. Click save when you're done.`}
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									value={editProductInfo.name}
									onChange={(event) => {
										setEditProductInfo({
											...editProductInfo,
											name: event.target.value,
										});
									}}
									className="col-span-4"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="description">Description</Label>
								<ScrollArea className="h-64 col-span-4 text-sm rounded-md border">
									<Editor
										content={
											user?.products.find((p) => p.id === editProductInfo.id)
												?.html_description || ""
										}
										updateDescription={(htmlContent: string, text: string) => {
											setEditProductInfo({
												...editProductInfo,
												description: text,
												htmlDescription: htmlContent,
											});
										}}
									/>
								</ScrollArea>
							</div>

							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="price">Price</Label>
								<Input
									id="price"
									value={editProductInfo.price}
									onChange={(event) => {
										setEditProductInfo({
											...editProductInfo,
											price: event.target.value,
										});
									}}
									className="col-span-4"
								/>
							</div>

							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="priceType">Price Type</Label>
								<Select
									value={editProductInfo.priceType}
									onValueChange={(value) => {
										setEditProductInfo({
											...editProductInfo,
											priceType: value as PriceType,
										});
									}}
								>
									<SelectTrigger className="w-[180px]">
										<SelectValue placeholder="Select a price type" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value={PriceType.OneTime}>
												{PriceType.OneTime}
											</SelectItem>
											<SelectItem value={PriceType.Subscription}>
												{PriceType.Subscription}
											</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="isShippable" className="col-span-3 text-sm">
									Do you want to collect a shipping address from the customer?
								</Label>
								<Checkbox
									id="isShippable"
									checked={editProductInfo.isShippable}
									onCheckedChange={(value) => {
										setEditProductInfo({
											...editProductInfo,
											isShippable: !!value,
										});
									}}
								/>
							</div>

							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="picture">Picture</Label>
								<Input
									id="picture"
									type="file"
									className="col-span-4"
									onChange={(event) => {
										uploadProductPhoto(event);
									}}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								type="submit"
								onClick={async () => {
									const formData = new FormData();
									formData.append("product-id", editProductInfo.id.toString());
									formData.append("product-name", editProductInfo.name);
									formData.append(
										"product-description",
										editProductInfo.description,
									);
									formData.append("product-price", editProductInfo.price);
									formData.append(
										"product-image-url",
										editProductInfo.imageUrl,
									);
									formData.append(
										"product-html-description",
										editProductInfo.htmlDescription,
									);
									formData.append(
										"product-is-shippable",
										editProductInfo.isShippable.toString(),
									);
									formData.append(
										"product-price-type",
										editProductInfo.priceType,
									);

									startTransition(async () => {
										await updateAction(formData);
									});
									setOpenEditProductDialog(false);
								}}
							>
								Save changes
							</Button>
						</DialogFooter>
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</>
	);
}
