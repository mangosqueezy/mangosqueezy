"use client";

import { CustomToast } from "@/components/mango-ui/custom-toast";
import { Badge } from "@/components/ui/badge";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Products } from "@prisma/client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import toast, { type Toast, Toaster } from "react-hot-toast";
import { checkAndCreateAffiliate } from "../actions";

interface NewUserFormInputs {
	firstName: string;
	lastName: string;
	email: string;
	productId: string;
}

interface ExistingUserFormInputs {
	email: string;
	productId: string;
}

export function ConnectifyForm({
	products,
	businessId,
	commission_percentage,
}: {
	products: Products[] | [];
	businessId: string;
	commission_percentage: number;
}) {
	const [selectedProduct, setSelectedProduct] = useState<Products | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [activeTab, setActiveTab] = useState<"new" | "existing">("new");

	const newUserForm = useForm<NewUserFormInputs>();
	const existingUserForm = useForm<ExistingUserFormInputs>();

	const productId =
		activeTab === "new"
			? newUserForm.watch("productId")
			: existingUserForm.watch("productId");

	useEffect(() => {
		if (products.length === 1) {
			if (activeTab === "new") {
				newUserForm.setValue("productId", products[0].id.toString());
			} else {
				existingUserForm.setValue("productId", products[0].id.toString());
			}
			setSelectedProduct(products[0]);
		}
	}, [products, newUserForm.setValue, existingUserForm.setValue, activeTab]);

	useEffect(() => {
		const product = products.find((p) => p.id.toString() === productId);
		setSelectedProduct(product || null);
	}, [productId, products]);

	async function onSubmit(data: NewUserFormInputs | ExistingUserFormInputs) {
		try {
			setSubmitting(true);
			const formData = new FormData();

			if (activeTab === "new") {
				const newUserData = data as NewUserFormInputs;
				formData.append("first_name", newUserData.firstName);
				formData.append("last_name", newUserData.lastName);
				formData.append("email", newUserData.email);
				formData.append("product_id", newUserData.productId);
			} else {
				const existingUserData = data as ExistingUserFormInputs;
				formData.append("first_name", "");
				formData.append("last_name", "");
				formData.append("email", existingUserData.email);
				formData.append("product_id", existingUserData.productId);
			}

			formData.append("business_id", businessId);
			formData.append("pipeline_id", "");

			const result = await checkAndCreateAffiliate(formData);

			toast.custom((t: Toast) => (
				<CustomToast
					t={t}
					message={result}
					variant={result.includes("successfully") ? "success" : "error"}
				/>
			));
		} catch (error) {
			toast.custom((t: Toast) => (
				<CustomToast
					t={t}
					message="An error occurred while creating the affiliate"
					variant="error"
				/>
			));
		} finally {
			setSubmitting(false);
		}
	}

	const renderNewUserProductSelect = (
		form: UseFormReturn<NewUserFormInputs>,
	) => (
		<FormField
			control={form.control}
			name="productId"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Select Product</FormLabel>
					<Select
						onValueChange={field.onChange}
						value={field.value}
						defaultValue={field.value}
					>
						<FormControl>
							<SelectTrigger>
								<SelectValue placeholder="Select a product" />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							{products.map((product) => (
								<SelectItem key={product.id} value={product.id.toString()}>
									{product.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			)}
		/>
	);

	const renderExistingUserProductSelect = (
		form: UseFormReturn<ExistingUserFormInputs>,
	) => (
		<FormField
			control={form.control}
			name="productId"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Select Product</FormLabel>
					<Select
						onValueChange={field.onChange}
						value={field.value}
						defaultValue={field.value}
					>
						<FormControl>
							<SelectTrigger>
								<SelectValue placeholder="Select a product" />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							{products.map((product) => (
								<SelectItem key={product.id} value={product.id.toString()}>
									{product.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			)}
		/>
	);

	return (
		<>
			<Toaster />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-0 relative min-h-screen">
				{/* Animated Vertical Divider */}
				<motion.div
					className="hidden md:block absolute left-1/2 top-0 w-0.5"
					initial={{ height: 0, opacity: 0 }}
					animate={{
						height: "100%",
						opacity: [0.2, 0.5, 0.2],
						background: [
							"linear-gradient(to bottom, transparent, #ff6b00, transparent)",
							"linear-gradient(to bottom, #ff6b00, transparent, #ff6b00)",
							"linear-gradient(to bottom, transparent, #ff6b00, transparent)",
						],
					}}
					transition={{
						duration: 3,
						ease: "easeInOut",
						repeat: Number.POSITIVE_INFINITY,
						repeatType: "reverse",
					}}
					style={{
						transform: "translateX(-50%)",
					}}
				/>

				{/* Form Section */}
				<div className="bg-gray-50 p-8 md:p-12 min-h-screen">
					<div className="max-w-md mx-auto">
						<Badge className="text-sm font-semibold mb-3 text-center bg-orange-300 text-orange-800 mb-5">
							Connectify
						</Badge>

						<Tabs
							defaultValue="new"
							className="w-full"
							onValueChange={(value) =>
								setActiveTab(value as "new" | "existing")
							}
						>
							<TabsList className="grid w-full grid-cols-2 mb-6">
								<TabsTrigger value="new">New User</TabsTrigger>
								<TabsTrigger value="existing">Existing User</TabsTrigger>
							</TabsList>

							<TabsContent value="new">
								<Form {...newUserForm}>
									<form
										onSubmit={newUserForm.handleSubmit(onSubmit)}
										className="space-y-6"
									>
										<div className="space-y-4">
											<FormField
												control={newUserForm.control}
												name="firstName"
												render={({ field }) => (
													<FormItem>
														<FormLabel>First Name</FormLabel>
														<FormControl>
															<Input placeholder="John" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={newUserForm.control}
												name="lastName"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Last Name</FormLabel>
														<FormControl>
															<Input placeholder="Doe" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={newUserForm.control}
												name="email"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Email Address</FormLabel>
														<FormControl>
															<Input
																type="email"
																placeholder="john.doe@example.com"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											{renderNewUserProductSelect(newUserForm)}
										</div>
										<motion.button
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											type="submit"
											disabled={submitting}
											className={`w-full bg-linear-to-r from-orange-500 to-orange-600 text-white py-3 px-4 
												rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 
												focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 
												transition duration-200 ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
										>
											{submitting ? "Submitting..." : "Submit"}
										</motion.button>
									</form>
								</Form>
							</TabsContent>

							<TabsContent value="existing">
								<Form {...existingUserForm}>
									<form
										onSubmit={existingUserForm.handleSubmit(onSubmit)}
										className="space-y-6"
									>
										<div className="space-y-4">
											<FormField
												control={existingUserForm.control}
												name="email"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Email Address</FormLabel>
														<FormControl>
															<Input
																type="email"
																placeholder="john.doe@example.com"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											{renderExistingUserProductSelect(existingUserForm)}
										</div>
										<motion.button
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											type="submit"
											disabled={submitting}
											className={`w-full bg-linear-to-r from-orange-500 to-orange-600 text-white py-3 px-4 
												rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 
												focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 
												transition duration-200 ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
										>
											{submitting ? "Submitting..." : "Submit"}
										</motion.button>
									</form>
								</Form>
							</TabsContent>
						</Tabs>
					</div>
				</div>

				{/* Product Section */}
				<div className="bg-white p-8 md:p-12 min-h-screen">
					<div className="max-w-md mx-auto space-y-8">
						{selectedProduct ? (
							<>
								<div className="relative aspect-4/3 rounded-xl overflow-hidden">
									<Image
										src={selectedProduct.image_url || "/product-image.jpg"}
										alt={selectedProduct.name}
										fill
										className="object-cover transform hover:scale-105 transition duration-700"
										priority
									/>
								</div>
								<div className="space-y-4">
									<motion.h2
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6 }}
										className="text-3xl font-bold text-gray-900"
									>
										{selectedProduct.name}
									</motion.h2>
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: 0.1 }}
										className="flex items-center justify-between bg-orange-50 p-4 rounded-lg"
									>
										<div>
											<p className="text-sm text-orange-700 font-medium">
												Product Price
											</p>
											<p className="text-2xl font-bold text-orange-900">
												${selectedProduct.price}
											</p>
										</div>
										<div className="text-right">
											<p className="text-sm text-orange-700 font-medium">
												Your Commission
											</p>
											<p className="text-2xl font-bold text-orange-900">
												$
												{(
													(commission_percentage / 100) *
													selectedProduct.price
												).toFixed(2)}
											</p>
											<p className="text-sm text-orange-600">
												({commission_percentage}%)
											</p>
										</div>
									</motion.div>
									<motion.p
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: 0.2 }}
										className="text-gray-600 leading-relaxed"
									>
										{selectedProduct.description}
									</motion.p>
								</div>
							</>
						) : (
							<div className="flex flex-col items-center justify-center h-full space-y-4 text-gray-500">
								<motion.p
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.6 }}
									className="text-lg"
								>
									Select a product to promote
								</motion.p>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
