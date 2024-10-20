"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Products } from "@prisma/client";
import { motion } from "framer-motion";
import {
	ChevronDown,
	ChevronUp,
	CreditCard,
	HandCoins,
	Loader,
	Mail,
} from "lucide-react";
import Image from "next/image";

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createOrderAction, navigate } from "../actions";

import { Label } from "@/components/ui/label";

const formDefaultValues = {
	email: "",
};

const FormSchema = z.object({
	email: z.string().min(1, {
		message: "Please enter the email.",
	}),
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
	const [open, setOpen] = useState(true);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const router = useRouter();
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: formDefaultValues,
	});

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			setMousePosition({ x: e.clientX, y: e.clientY });
		};

		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);

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
		<div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div
					className="absolute inset-0 opacity-30"
					style={{
						backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1) 0%, transparent 15%)`,
						transition: "background 0.3s ease",
					}}
				/>
				<div className="absolute inset-0">
					{[...Array(20)].map((_, i) => (
						<div
							key={`${i}-${Math.random()}`}
							className="absolute bg-blue-500 rounded-full opacity-20 animate-float"
							style={{
								width: `${Math.random() * 10 + 5}px`,
								height: `${Math.random() * 10 + 5}px`,
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
								animationDuration: `${Math.random() * 10 + 10}s`,
								animationDelay: `${Math.random() * 5}s`,
							}}
						/>
					))}
				</div>
			</div>

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="w-full md:max-w-3xl space-y-6"
				>
					<Card className="w-full max-w-4xl overflow-hidden shadow-2xl bg-white/95 backdrop-blur-md relative z-10">
						<CardContent className="p-0">
							<div className="md:flex">
								<div className="md:w-1/2">
									<motion.div
										className="relative h-64 md:h-full overflow-hidden"
										whileHover={{ scale: 1.05 }}
										transition={{ duration: 0.3 }}
									>
										<Image
											src={product?.image_url as string}
											alt={"product image"}
											width={400}
											height={400}
											className="w-full h-full object-cover"
										/>
									</motion.div>
								</div>
								<div className="md:w-1/2 p-6 md:p-8 space-y-6">
									<div>
										<h2 className="text-2xl font-bold mb-2">{product?.name}</h2>
										<p className="text-3xl font-bold text-primary">
											{formattedAmount}
										</p>
									</div>
									<div>
										<p
											className={`text-gray-600 ${isExpanded ? "" : "line-clamp-3"}`}
										>
											{product?.description}
											daily life.
										</p>
										<Button
											variant="link"
											type="button"
											className="p-0 h-auto font-semibold text-primary"
											onClick={toggleDescription}
										>
											{isExpanded ? (
												<>
													Read less <ChevronUp className="ml-1 h-4 w-4" />
												</>
											) : (
												<>
													Read more <ChevronDown className="ml-1 h-4 w-4" />
												</>
											)}
										</Button>
									</div>
									<div className="space-y-4">
										<div className="space-y-2">
											<div className="relative">
												<FormField
													control={form.control}
													name="email"
													render={({ field }) => (
														<>
															<FormItem>
																<FormControl>
																	<div className="space-y-2">
																		<Label htmlFor="email">Email</Label>
																		<div className="relative">
																			<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />

																			<Input
																				type="email"
																				id="email"
																				className="pl-10"
																				placeholder="Enter your email"
																				{...field}
																			/>
																		</div>
																	</div>
																</FormControl>
																<FormMessage />
															</FormItem>
														</>
													)}
												/>
											</div>
										</div>
										<motion.div
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											{realTimePaymentsEnabled && (
												<Button
													type="submit"
													onClick={() => form.setValue("action-type", "xrp")}
													color="orange"
													className={cn(
														"w-full px-4 py-6 my-8 cursor-pointer",
														isXRPButtonLoading && "cursor-not-allowed",
													)}
													disabled={isXRPButtonLoading}
												>
													<HandCoins className="mr-2 h-5 w-5" />
													Pay with crypto
													{isXRPButtonLoading && (
														<Loader className="animate-spin" />
													)}
												</Button>
											)}

											<Button
												type="submit"
												onClick={() => form.setValue("action-type", "moonpay")}
												size="lg"
												className={cn(
													"w-full px-4 py-6 font-semibold cursor-pointer",
													isPayButtonLoading && "cursor-not-allowed",
												)}
												disabled={isPayButtonLoading}
											>
												<CreditCard className="mr-2 h-5 w-5" />
												Pay with card
												{isPayButtonLoading && (
													<Loader className="animate-spin" />
												)}
											</Button>
										</motion.div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</form>
			</Form>
			{messages.length > 0 && (
				<AlertDialog open={open} onOpenChange={setOpen}>
					<AlertDialogContent>
						<AlertDialogHeader className="flex justify-center items-center">
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								<Image
									src={messages[1]}
									alt="XRP logo"
									width={292}
									height={292}
								/>
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</div>
	);
}
