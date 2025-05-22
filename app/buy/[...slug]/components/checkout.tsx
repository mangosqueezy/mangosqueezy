"use client";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useJune } from "@/hooks/useJune";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Products } from "@prisma/client";
import {
	ChevronDown,
	ChevronUp,
	CreditCard,
	HandCoins,
	Loader,
	Mail,
} from "lucide-react";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createOrderAction, navigate } from "../actions";

import { Editor } from "@/components/mango-ui/editor";
import { Label } from "@/components/ui/label";

import Cookies from "js-cookie";

const squzyPartnerData = Cookies.get("squzy_partner_data");
const { partner, discount } = squzyPartnerData
	? JSON.parse(squzyPartnerData)
	: {};

const formDefaultValues = {
	email: "",
	quantity: 1,
	customer_address: "",
};

const FormSchema = z.object({
	email: z.string().min(1, {
		message: "Please enter the email.",
	}),
	quantity: z
		.number()
		.min(1, {
			message: "Please enter the quantity.",
		})
		.optional(),
	customer_address: z
		.string()
		.min(1, {
			message: "Please enter the customer address.",
		})
		.optional(),
	"action-type": z.string(),
});

type TCheckout = {
	product: Products | null;
	formattedAmount: string;
	affiliateId: number | undefined;
	moonpayEnabled: boolean;
	realTimePaymentsEnabled: boolean;
};

export default function Checkout({
	product,
	formattedAmount,
	affiliateId,
	moonpayEnabled,
	realTimePaymentsEnabled,
}: TCheckout) {
	const [isExpanded, setIsExpanded] = useState(false);
	const analytics = useJune(process.env.NEXT_PUBLIC_JUNE_API_KEY!);
	const [isXRPButtonLoading, setIsXRPButtonLoading] = useState(false);
	const [isPayButtonLoading, setIsPayButtonLoading] = useState(false);
	const [messages, setMessages] = useState<Array<string>>([]);
	const [eventSource, setEventSource] = useState<EventSource | null>(null);
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: formDefaultValues,
	});

	const startStreaming = () => {
		if (eventSource) {
			// If there's an existing connection, close it
			eventSource.close();
		}

		const newEventSource = new EventSource(
			`https://www.mangosqueezy.com/api/xaman?amount=${product?.price.toString()}`,
		);

		newEventSource.onmessage = (event) => {
			const newMessage = event.data;
			setMessages((prevMessages) => [...prevMessages, newMessage]);
		};

		newEventSource.onerror = () => {
			newEventSource.close();
			setEventSource(null);
		};

		setEventSource(newEventSource);
	};

	const createOrderHandler = useCallback(async () => {
		setIsXRPButtonLoading(true);

		analytics?.track("Order Created", {
			product_id: product?.id,
			product_price: product?.price,
			affiliate_id: affiliateId,
			email: form.getValues("email"),
			type: "xrp",
		});

		const productId = product?.id ?? "";
		const parsedAffiliateId = affiliateId ?? "";

		const formData = new FormData();
		formData.append("email", form.getValues("email"));
		formData.append("business_id", product?.business_id as string);
		formData.append("product_id", productId.toString());
		formData.append("affiliate_id", parsedAffiliateId.toString());
		formData.append("amount", product?.price.toString() as string);

		const quantity = form.getValues("quantity");
		if (quantity !== undefined) {
			formData.append("quantity", quantity.toString());
		}

		if (form.getValues("customer_address")) {
			formData.append(
				"customer_address",
				form.getValues("customer_address") as string,
			);
		}

		const result = await createOrderAction(formData);

		if (result) {
			router.push("/success");
		}
	}, [affiliateId, form, product, router, analytics]);

	useEffect(() => {
		if (messages.length > 0) {
			const successVal = messages.find((message) => message === "tesSUCCESS");
			if (successVal) {
				createOrderHandler();
				setOpen(false);
				if (eventSource) {
					eventSource.close();
				}
			} else {
				setOpen(true);
			}
		}
	}, [messages, createOrderHandler, eventSource]);

	const callPay = async (email: string, amount: string) => {
		setIsPayButtonLoading(true);
		const parsedAmount = Number.parseFloat(amount);
		if (parsedAmount > 30 && moonpayEnabled) {
			analytics?.track("Order Created", {
				product_id: product?.id,
				product_price: product?.price,
				affiliate_id: affiliateId,
				email,
				type: "moonpay",
			});

			const formData = new FormData();
			formData.append("email", email);
			formData.append("amount", product?.price.toString() as string);
			const response = await fetch("https://www.mangosqueezy.com/api/moonpay", {
				method: "POST",
				body: formData,
			});

			const url = await response.json();

			if (url) {
				const navigatForm = new FormData();
				navigatForm.append("url", url);
				navigate(navigatForm);
			}
		} else {
			analytics?.track("Order Created", {
				product_id: product?.id,
				product_price: product?.price,
				affiliate_id: affiliateId,
				email,
				type: "stripe",
			});
			const productId = product?.id ?? "";
			const parsedAffiliateId = affiliateId ?? "";

			const formData = new FormData();
			formData.append("product_name", product?.name as string);
			formData.append("amount", product?.price.toString() as string);
			formData.append("email", form.getValues("email"));
			formData.append("business_id", product?.business_id as string);
			formData.append("product_id", productId.toString());
			formData.append("affiliate_id", parsedAffiliateId.toString());
			formData.append("price_type", product?.price_type as string);

			const quantity = form.getValues("quantity");
			if (quantity !== undefined) {
				formData.append("quantity", quantity.toString());
			}

			const customer_address = form.getValues("customer_address");
			if (customer_address !== undefined) {
				formData.append("customer_address", customer_address as string);
			}

			const response = await fetch("https://www.mangosqueezy.com/api/stripe", {
				method: "POST",
				body: formData,
			});

			const url = await response.json();

			if (url) {
				const navigatForm = new FormData();
				navigatForm.append("url", url);
				navigate(navigatForm);
			}
		}
	};

	useEffect(() => {
		if (analytics) {
			analytics.page("Buy", {
				affiliate_id: affiliateId,
			});
		}
	}, [analytics, affiliateId]);

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		const actionType = form.getValues("action-type");

		if (actionType === "moonpay") {
			await callPay(form.getValues("email"), formattedAmount);
		} else if (actionType === "xrp") {
			startStreaming();
		}
	}

	const toggleDescription = () => {
		setIsExpanded(!isExpanded);
	};

	return (
		<>
			{partner && (
				<div className="flex items-center gap-2">
					<img
						src={partner?.image}
						alt={partner?.name}
						className="size-6 rounded-full"
					/>
					<p>
						{partner?.name} referred you to mangosqueezy and gave you{" "}
						{discount?.amount} {discount?.type} off
					</p>
				</div>
			)}

			<div className="min-h-screen bg-linear-to-b from-[#fafafa] to-[#f5f5f5] dark:from-[#1a1a1a] dark:to-[#141414] flex">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full">
						<div className="flex flex-col md:flex-row w-full relative">
							{/* Product Details - Left Side */}
							<div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col">
								<div className="sticky top-16">
									<div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#f7f7f7] dark:bg-[#252525] mb-8">
										<Image
											src={product?.image_url as string}
											alt={"product image"}
											width={400}
											height={400}
											className="w-full h-full object-cover"
										/>
									</div>

									<h1 className="text-3xl font-semibold text-[#37352f] dark:text-[#e6e6e6] mb-4">
										{product?.name}
									</h1>

									<p className="text-4xl font-bold text-[#37352f] dark:text-[#e6e6e6] mb-6">
										{formattedAmount}
									</p>

									<div className="flex flex-col gap-6">
										<div
											className={cn(
												"prose dark:prose-invert max-w-none",
												!isExpanded && "line-clamp-4",
											)}
										>
											<div className="flex flex-col md:flex-row gap-6">
												<div className="flex-1">
													<Editor
														content={product?.html_description as string}
														disabled={true}
													/>
												</div>
											</div>
										</div>

										<Button
											variant="ghost"
											type="button"
											className="p-0 h-auto text-sm font-medium text-[#787774] dark:text-[#999999] hover:text-[#37352f] dark:hover:text-[#e6e6e6] hover:bg-transparent"
											onClick={toggleDescription}
										>
											{isExpanded ? (
												<>
													Show less <ChevronUp className="ml-1 h-3 w-3" />
												</>
											) : (
												<>
													Show more <ChevronDown className="ml-1 h-3 w-3" />
												</>
											)}
										</Button>
									</div>
								</div>
							</div>

							{/* Animated Separator - Only visible on desktop */}
							<div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2">
								<div className="absolute inset-0 bg-[#e6e6e6] dark:bg-[#2f2f2f]" />
								<div className="absolute inset-0 overflow-hidden">
									<div className="absolute top-0 w-px h-32 bg-linear-to-b from-black/0 via-black/20 to-black/0 dark:from-white/0 dark:via-white/20 dark:to-white/0 animate-separator" />
								</div>
							</div>

							{/* Checkout Form - Right Side */}
							<div className="w-full md:w-1/2 p-6 md:p-16 bg-white dark:bg-[#202020]">
								<div className="max-w-lg mx-auto">
									<h2 className="text-2xl font-semibold mb-2 text-[#37352f] dark:text-[#e6e6e6]">
										Complete your purchase
									</h2>
									<p className="text-sm text-[#787774] dark:text-[#999999] mb-8">
										Enter your details below to complete the purchase
									</p>

									<div className="space-y-6">
										<FormField
											control={form.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<div className="space-y-2">
															<Label
																htmlFor="email"
																className="text-sm font-medium text-[#37352f] dark:text-[#e6e6e6]"
															>
																Email
															</Label>
															<div className="relative">
																<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#787774] dark:text-[#999999] h-4 w-4" />
																<Input
																	type="email"
																	id="email"
																	className="pl-10 h-11 bg-white dark:bg-[#252525] border-[#e6e6e6] dark:border-[#2f2f2f] focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent rounded-md"
																	placeholder="you@example.com"
																	{...field}
																/>
															</div>
														</div>
													</FormControl>
													<FormMessage className="text-red-500 text-sm mt-1" />
												</FormItem>
											)}
										/>

										{product?.is_shippable && (
											<>
												<FormField
													control={form.control}
													name="quantity"
													render={({ field }) => (
														<FormItem>
															<FormControl>
																<div className="space-y-2">
																	<Label
																		htmlFor="quantity"
																		className="text-sm font-medium text-[#37352f] dark:text-[#e6e6e6]"
																	>
																		Quantity
																	</Label>
																	<Input
																		type="number"
																		id="quantity"
																		className="h-11 bg-white dark:bg-[#252525] border-[#e6e6e6] dark:border-[#2f2f2f] focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent rounded-md"
																		placeholder="1"
																		{...field}
																	/>
																</div>
															</FormControl>
															<FormMessage className="text-red-500 text-sm mt-1" />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name="customer_address"
													render={({ field }) => (
														<FormItem>
															<FormControl>
																<div className="space-y-2">
																	<Label
																		htmlFor="customer_address"
																		className="text-sm font-medium text-[#37352f] dark:text-[#e6e6e6]"
																	>
																		Shipping address
																	</Label>
																	<Input
																		type="text"
																		id="customer_address"
																		className="h-11 bg-white dark:bg-[#252525] border-[#e6e6e6] dark:border-[#2f2f2f] focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent rounded-md"
																		placeholder="Enter your shipping address"
																		{...field}
																	/>
																</div>
															</FormControl>
															<FormMessage className="text-red-500 text-sm mt-1" />
														</FormItem>
													)}
												/>
											</>
										)}

										<div className="pt-6 space-y-4">
											{realTimePaymentsEnabled && (
												<Button
													type="submit"
													onClick={() => form.setValue("action-type", "xrp")}
													className={cn(
														"w-full h-11 bg-white dark:bg-[#252525] text-[#37352f] dark:text-[#e6e6e6] border border-[#e6e6e6] dark:border-[#2f2f2f] hover:bg-[#f7f7f7] dark:hover:bg-[#2a2a2a] transition-all rounded-md",
														isXRPButtonLoading &&
															"cursor-not-allowed opacity-50",
													)}
													disabled={isXRPButtonLoading}
												>
													<HandCoins className="mr-2 h-4 w-4" />
													Pay with crypto
													{isXRPButtonLoading && (
														<Loader className="ml-2 h-4 w-4 animate-spin" />
													)}
												</Button>
											)}

											<Button
												type="submit"
												onClick={() => form.setValue("action-type", "moonpay")}
												className={cn(
													"w-full h-11 bg-orange-500 dark:bg-white text-white dark:text-black hover:bg-orange-600 dark:hover:bg-orange-100 transition-all rounded-md",
													isPayButtonLoading && "cursor-not-allowed opacity-50",
												)}
												disabled={isPayButtonLoading}
											>
												<CreditCard className="mr-2 h-4 w-4" />
												Pay with card
												{isPayButtonLoading && (
													<Loader className="ml-2 h-4 w-4 animate-spin" />
												)}
											</Button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</form>
				</Form>

				<style jsx global>{`
				@keyframes separator {
					0% {
						transform: translateY(-100%);
					}
					100% {
						transform: translateY(1000%);
					}
				}
				.animate-separator {
					animation: separator 3s linear infinite;
					will-change: transform;
				}
			`}</style>
			</div>
		</>
	);
}
