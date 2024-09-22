"use client";
import { Button } from "@/components/mango-ui/button";
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
import type { Products } from "@prisma/client";
import { CreditCard, HandCoins, Loader } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createOrderAction, navigate } from "../actions";

const formDefaultValues = {
	email: "",
};

const FormSchema = z.object({
	email: z.string().min(1, {
		message: "Please enter the email.",
	}),
	"action-type": z.string(),
});

type TBuyForm = {
	product: Products | null;
	formattedAmount: string;
	affiliateId: number | undefined;
	moonpayEnabled: boolean;
};

export default function BuyForm({
	product,
	formattedAmount,
	affiliateId,
	moonpayEnabled,
}: TBuyForm) {
	const analytics = useJune(process.env.NEXT_PUBLIC_JUNE_API_KEY!);
	const [isXRPButtonLoading, setIsXRPButtonLoading] = useState(false);
	const [isPayButtonLoading, setIsPayButtonLoading] = useState(false);
	const [messages, setMessages] = useState<Array<string>>([]);
	const [eventSource, setEventSource] = useState<EventSource | null>(null);
	const [open, setOpen] = useState(true);
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

	return (
		<div className="bg-gray-50">
			<div className="justify-center flex mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
				<h2 className="sr-only">Checkout</h2>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="w-full md:max-w-3xl space-y-6"
					>
						<div className="grid">
							{/* Order summary */}
							<div className="mt-10 lg:mt-0">
								<h2 className="text-lg font-medium text-gray-900">Checkout</h2>

								<div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
									<div className="mt-4 px-4 py-6 sm:px-6">
										<label
											htmlFor="email-address"
											className="block text-sm font-medium text-gray-700"
										>
											Email address
										</label>
										<div className="mt-1">
											<FormField
												control={form.control}
												name="email"
												render={({ field }) => (
													<>
														<FormItem>
															<FormControl>
																<Input {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													</>
												)}
											/>
										</div>
									</div>

									<h3 className="sr-only">Items in your cart</h3>
									<ul className="divide-y divide-gray-200">
										{product && (
											<li key={product.id} className="flex px-4 py-6 sm:px-6">
												<div className="flex-shrink-0">
													<Image
														src={product.image_url as string}
														alt={"product image"}
														width={200}
														height={200}
														className="w-20 md:w-80 rounded-md"
													/>
												</div>

												<div className="ml-6 flex flex-1 flex-col">
													<div className="flex">
														<div className="min-w-0 flex-1">
															<h4 className="text-sm font-medium text-gray-900">
																{product.name}
															</h4>
															<p className="text-sm text-gray-500">
																{product.description}
															</p>
														</div>
													</div>

													<div className="flex flex-1 items-end justify-between pt-2">
														<p className="mt-1 text-sm font-medium text-gray-900">
															{formattedAmount}
														</p>
													</div>
												</div>
											</li>
										)}
									</ul>

									<div className="border-t border-gray-200 px-4 py-6 sm:px-6">
										<Button
											type="submit"
											onClick={() => form.setValue("action-type", "xrp")}
											color="orange"
											className={cn(
												"w-full px-4 py-3 my-8 cursor-pointer",
												isXRPButtonLoading && "cursor-not-allowed",
											)}
											disabled={isXRPButtonLoading}
										>
											<HandCoins className="mr-2" />
											Pay with crypto
											{isXRPButtonLoading && (
												<Loader className="animate-spin" />
											)}
										</Button>

										{messages.length > 0 && (
											<AlertDialog open={open} onOpenChange={setOpen}>
												<AlertDialogContent>
													<AlertDialogHeader className="flex justify-center items-center">
														<AlertDialogTitle>
															Are you absolutely sure?
														</AlertDialogTitle>
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

										<Button
											type="submit"
											onClick={() => form.setValue("action-type", "moonpay")}
											color="blue"
											className={cn(
												"w-full px-4 py-3 cursor-pointer",
												isPayButtonLoading && "cursor-not-allowed",
											)}
											disabled={isPayButtonLoading}
										>
											<CreditCard className="mr-2" />
											Pay with card
											{isPayButtonLoading && (
												<Loader className="animate-spin" />
											)}
										</Button>
									</div>
								</div>
							</div>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
}
