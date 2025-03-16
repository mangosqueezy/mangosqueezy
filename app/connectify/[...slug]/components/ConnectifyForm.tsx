"use client";

import { CustomToast } from "@/components/mango-ui/custom-toast";
import { Badge } from "@/components/ui/badge";
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
		<div>
			<label
				htmlFor="productId"
				className="block text-sm font-medium text-gray-700"
			>
				Select Product
			</label>
			<select
				{...form.register("productId", {
					required: "Please select a product",
				})}
				className="mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm 
					 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50
					 transition duration-200"
			>
				<option value="">Select a product</option>
				{products.map((product) => (
					<option key={product.id} value={product.id}>
						{product.name}
					</option>
				))}
			</select>
			{form.formState.errors.productId && (
				<motion.p
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="mt-2 text-sm text-red-600"
				>
					{String(form.formState.errors.productId.message)}
				</motion.p>
			)}
		</div>
	);

	const renderExistingUserProductSelect = (
		form: UseFormReturn<ExistingUserFormInputs>,
	) => (
		<div>
			<label
				htmlFor="productId"
				className="block text-sm font-medium text-gray-700"
			>
				Select Product
			</label>
			<select
				{...form.register("productId", {
					required: "Please select a product",
				})}
				className="mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm 
					 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50
					 transition duration-200"
			>
				<option value="">Select a product</option>
				{products.map((product) => (
					<option key={product.id} value={product.id}>
						{product.name}
					</option>
				))}
			</select>
			{form.formState.errors.productId && (
				<motion.p
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="mt-2 text-sm text-red-600"
				>
					{String(form.formState.errors.productId.message)}
				</motion.p>
			)}
		</div>
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
						<Badge className="text-sm font-semibold mb-3 text-center bg-orange-300 text-orange-800">
							Connectify
						</Badge>
						<h2 className="text-2xl font-semibold mb-6 text-gray-800">
							Personal Information
						</h2>

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
								<form
									onSubmit={newUserForm.handleSubmit(onSubmit)}
									className="space-y-6"
								>
									<div className="space-y-4">
										<div>
											<label
												htmlFor="firstName"
												className="block text-sm font-medium text-gray-700"
											>
												First Name
											</label>
											<input
												{...newUserForm.register("firstName", {
													required: "First name is required",
												})}
												type="text"
												className="mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm 
													focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50
													transition duration-200"
												placeholder="John"
											/>
											{newUserForm.formState.errors.firstName && (
												<motion.p
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													className="mt-2 text-sm text-red-600"
												>
													{newUserForm.formState.errors.firstName.message}
												</motion.p>
											)}
										</div>

										<div>
											<label
												htmlFor="lastName"
												className="block text-sm font-medium text-gray-700"
											>
												Last Name
											</label>
											<input
												{...newUserForm.register("lastName", {
													required: "Last name is required",
												})}
												type="text"
												className="mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm 
													focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50
													transition duration-200"
												placeholder="Doe"
											/>
											{newUserForm.formState.errors.lastName && (
												<motion.p
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													className="mt-2 text-sm text-red-600"
												>
													{newUserForm.formState.errors.lastName.message}
												</motion.p>
											)}
										</div>

										<div>
											<label
												htmlFor="email"
												className="block text-sm font-medium text-gray-700"
											>
												Email Address
											</label>
											<input
												{...newUserForm.register("email", {
													required: "Email is required",
													pattern: {
														value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
														message: "Invalid email address",
													},
												})}
												type="email"
												className="mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm 
													focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50
													transition duration-200"
												placeholder="john.doe@example.com"
											/>
											{newUserForm.formState.errors.email && (
												<motion.p
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													className="mt-2 text-sm text-red-600"
												>
													{newUserForm.formState.errors.email.message}
												</motion.p>
											)}
										</div>

										{renderNewUserProductSelect(newUserForm)}
									</div>

									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										type="submit"
										disabled={submitting}
										className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 
											rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 
											focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 
											transition duration-200 ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
									>
										{submitting ? "Submitting..." : "Submit"}
									</motion.button>
								</form>
							</TabsContent>

							<TabsContent value="existing">
								<form
									onSubmit={existingUserForm.handleSubmit(onSubmit)}
									className="space-y-6"
								>
									<div className="space-y-4">
										<div>
											<label
												htmlFor="email"
												className="block text-sm font-medium text-gray-700"
											>
												Email Address
											</label>
											<input
												{...existingUserForm.register("email", {
													required: "Email is required",
													pattern: {
														value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
														message: "Invalid email address",
													},
												})}
												type="email"
												className="mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm 
													focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50
													transition duration-200"
												placeholder="john.doe@example.com"
											/>
											{existingUserForm.formState.errors.email && (
												<motion.p
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													className="mt-2 text-sm text-red-600"
												>
													{existingUserForm.formState.errors.email.message}
												</motion.p>
											)}
										</div>

										{renderExistingUserProductSelect(existingUserForm)}
									</div>

									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										type="submit"
										disabled={submitting}
										className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 
											rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 
											focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 
											transition duration-200 ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
									>
										{submitting ? "Submitting..." : "Submit"}
									</motion.button>
								</form>
							</TabsContent>
						</Tabs>
					</div>
				</div>

				{/* Product Section */}
				<div className="bg-white p-8 md:p-12 min-h-screen">
					<div className="max-w-md mx-auto space-y-8">
						{selectedProduct ? (
							<>
								<div className="relative aspect-[4/3] rounded-xl overflow-hidden">
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
