"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { Products } from "@prisma/client";
import type { ChatMessage } from "@prisma/client";
import { ArrowRight, Loader2, Plus, UserCircle, X } from "lucide-react";
import Image from "next/image";
import {
	useActionState,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	createChatMessageAction,
	deleteAffiliateAction,
	getAffiliatesAction,
} from "./actions";

export type Affiliate = {
	handle: string;
	displayName: string;
	avatar: string;
	evaluation: "Yes" | "No";
	tag: string;
	reason: string;
	status: "active" | "inactive";
};

export default function Campaign({
	pipeline_id,
	affiliates,
	product,
	commission,
	chatMessages,
	affiliate_count,
	difficulty,
	platform,
}: {
	pipeline_id: number;
	affiliates: Affiliate[];
	product: Products | undefined;
	commission: number;
	chatMessages: ChatMessage[];
	affiliate_count: number;
	difficulty: string;
	platform: string;
}) {
	const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(
		null,
	);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<
		{ sender: string; text: string; date: Date }[]
	>([]);
	const [isLoading, setIsLoading] = useState(false);

	const handleAddAffiliate = useCallback(async () => {
		setIsLoading(true);

		let nextDifficulty = difficulty;
		if (difficulty === "hard") {
			nextDifficulty = "medium";
		} else if (difficulty === "medium") {
			nextDifficulty = "easy";
		}

		await getAffiliatesAction({
			product_id: product?.id.toString() || "",
			pipeline_id: pipeline_id.toString(),
			affiliate_count: affiliate_count.toString(),
			difficulty: nextDifficulty,
		});
		setIsLoading(false);
	}, [product?.id, pipeline_id, affiliate_count, difficulty]);

	const handleDeleteAffiliate = (handle: string) => {
		const updatedAffiliates = affiliates.map((affiliate) =>
			affiliate.handle === handle
				? { ...affiliate, status: "inactive" as const }
				: affiliate,
		);

		deleteAffiliateAction(
			pipeline_id.toString(),
			difficulty,
			updatedAffiliates,
			platform,
		);
	};

	const handleSendMessage = async () => {
		if (message.trim()) {
			setMessages([
				...messages,
				{ sender: "amit@tapasom.com", text: message, date: new Date() },
			]);
			setMessage("");

			await createChatMessageAction(
				pipeline_id,
				message,
				selectedAffiliate?.handle as string,
			);
		}
	};

	const activeAffiliates = useMemo(
		() => affiliates.filter((affiliate) => affiliate.status === "active"),
		[affiliates],
	);

	useEffect(() => {
		if (selectedAffiliate) {
			const messages = chatMessages
				.map((message) => {
					if (
						message.sender === selectedAffiliate.handle ||
						message.receiver === selectedAffiliate.handle
					) {
						return {
							sender: message.sender,
							text: message.text,
							date: message.created_at,
						};
					}
					return null;
				})
				.filter(
					(msg): msg is { sender: string; text: string; date: Date } =>
						msg !== null,
				);
			setMessages(messages);
		}
	}, [chatMessages, selectedAffiliate]);

	return (
		<div className="container mx-auto px-4">
			{/* Header Section */}
			<div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
				<div className="flex flex-col lg:flex-row gap-8 items-center">
					<div className="w-full h-full lg:w-1/4">
						<div className="relative aspect-square w-full">
							<Image
								src={product?.image_url || ""}
								alt="Product"
								width={100}
								height={100}
								className="rounded-lg object-cover w-full h-full"
							/>
						</div>
					</div>

					<div className="w-full lg:w-1/2">
						<h1 className="text-2xl font-bold mb-4">{product?.name}</h1>
						<p className="text-gray-700 text-sm">{product?.description}</p>
					</div>

					<div className="w-full lg:w-1/4 flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
						<div className="text-center mb-4">
							<p className="text-3xl font-bold text-green-500">{commission}%</p>
							<p className="text-sm text-gray-600">Commission Rate</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-gray-800">
								{affiliate_count}
							</p>
							<p className="text-sm text-gray-600">No of Affiliates</p>
						</div>
					</div>
				</div>
			</div>

			{affiliates.length === 0 && (
				<div className="my-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
					<p className="text-xs text-orange-700">
						We couldn't find suitable affiliates for this product. This might be
						because:
					</p>
					<ul className="mt-2 text-xs text-orange-600 list-disc list-inside">
						<li>
							The product description needs more specific details, it might be
							too broad
						</li>
					</ul>
					<p className="mt-2 text-xs text-orange-700">
						Consider updating the product description with more specific details
						and product benefits.
					</p>
				</div>
			)}

			{/* Updated Chat Interface */}
			<div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
				<div className="flex flex-col md:flex-row h-[700px]">
					{/* Affiliates List - Updated */}
					<div className="w-full md:w-[380px] border-r border-gray-100">
						<div className="p-5 bg-white border-b">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="text-xl font-bold text-gray-800">Messages</h2>
									<p className="text-sm text-gray-500 mt-1">
										Select an affiliate to chat
									</p>
									<p className="text-sm text-gray-500 mt-1 flex items-center">
										{`Platform: ${platform}`}
										<Image
											src={`/logo-cluster/${platform}.svg`}
											alt={platform}
											width={30}
											height={30}
										/>
									</p>
								</div>

								{activeAffiliates.length !== affiliate_count && (
									<Button
										variant="ghost"
										size="icon"
										onClick={handleAddAffiliate}
										className="hover:bg-orange-100"
										aria-label="Add new affiliate"
										disabled={isLoading}
									>
										{isLoading ? (
											<Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
										) : (
											<Plus className="w-5 h-5 text-orange-500" />
										)}
									</Button>
								)}
							</div>
						</div>
						<div className="overflow-y-auto h-[calc(100%-85px)]">
							{affiliates
								.filter((affiliate) => affiliate.status === "active")
								.map((affiliate) => (
									<div key={`container-${affiliate.handle}`}>
										<div
											key={affiliate.handle}
											className={`flex items-center justify-between p-5 cursor-pointer transition-all ${
												selectedAffiliate?.handle === affiliate.handle
													? "bg-orange-50 border-l-4 border-l-orange-500"
													: "hover:bg-gray-50 border-l-4 border-l-transparent"
											}`}
										>
											<div
												className="flex items-center gap-3 min-w-0 flex-grow"
												onClick={() => setSelectedAffiliate(affiliate)}
												onKeyDown={(e) =>
													e.key === "Enter" && setSelectedAffiliate(affiliate)
												}
											>
												<Image
													src={affiliate.avatar}
													alt="Avatar"
													width={36}
													height={36}
													className="rounded-full"
												/>
												<p className="font-semibold text-gray-900 text-sm truncate">
													{affiliate.displayName}
												</p>
											</div>
											<Button
												variant="ghost"
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													handleDeleteAffiliate(affiliate.handle);
												}}
												className="p-1 hover:bg-gray-100 rounded-full transition-colors"
												aria-label="Delete affiliate"
											>
												<X className="w-4 h-4 text-gray-500 hover:text-red-500" />
											</Button>
										</div>
										<Separator
											className="w-full"
											key={`${affiliate.handle}-separator`}
										/>
									</div>
								))}
						</div>
					</div>

					{/* Chat Area - Updated */}
					<div className="flex-1 flex flex-col bg-gray-50">
						{selectedAffiliate ? (
							<>
								{/* Chat Header */}
								<div className="p-5 bg-white border-b border-gray-100">
									<div className="grid grid-cols-[36px_1fr] gap-3 items-center">
										<div className="relative w-9 h-9 rounded-full bg-orange-100 overflow-hidden">
											<Image
												src={selectedAffiliate.avatar}
												alt="Avatar"
												fill
												className="object-cover"
											/>
										</div>
										<div className="grid gap-0.5">
											<h3 className="font-bold text-md text-gray-900">
												{selectedAffiliate.displayName}
											</h3>
											<p className="text-xs text-gray-500">
												{selectedAffiliate.reason}
											</p>
										</div>
									</div>
								</div>

								{/* Messages */}
								<div
									className="flex-1 overflow-y-auto p-6 space-y-6"
									style={{
										backgroundImage:
											"repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)",
										backgroundSize: "100% 32px",
										backgroundPosition: "0 0",
									}}
								>
									{messages.map((msg, index) => (
										<div
											key={`${msg.sender}-${index}`}
											className={`flex ${msg.sender === "amit@tapasom.com" ? "justify-end" : "justify-start"}`}
										>
											<div
												className={`max-w-[85%] md:max-w-[70%] ${
													msg.sender === "amit@tapasom.com"
														? "bg-orange-200 text-gray-800"
														: "bg-white text-gray-800"
												} px-5 py-3.5 rounded-2xl shadow-sm`}
											>
												<p className="text-[15px] leading-relaxed">
													{msg.text}
												</p>
												<p
													className={`text-xs mt-1.5 ${
														msg.sender === "amit@tapasom.com"
															? "text-gray-600"
															: "text-gray-400"
													}`}
												>
													{msg.date.toLocaleTimeString([], {
														hour: "2-digit",
														minute: "2-digit",
													})}
												</p>
											</div>
										</div>
									))}
								</div>

								{/* Message Input */}
								<div className="p-5 bg-white border-t border-gray-100">
									<div className="flex gap-3 items-center">
										<Input
											value={message}
											onChange={(e) => setMessage(e.target.value)}
											placeholder="Send a message..."
											className="flex-1 px-5 py-3.5 bg-gray-50 rounded-xl border-0 text-gray-800 placeholder-gray-400 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
											onKeyPress={(e) =>
												e.key === "Enter" && handleSendMessage()
											}
										/>
										<Button
											onClick={handleSendMessage}
											type="button"
											className="p-3.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20"
										>
											<ArrowRight className="w-6 h-6" />
										</Button>
									</div>
								</div>
							</>
						) : (
							<div className="flex-1 flex flex-col items-center justify-center text-center p-6">
								<div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
									<UserCircle className="w-8 h-8 text-orange-500" />
								</div>
								<h3 className="text-xl font-semibold text-gray-800 mb-2">
									Select a Conversation
								</h3>
								<p className="text-gray-500 max-w-sm text-sm">
									Choose an affiliate from the list to start chatting
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
