"use client";

import type { ChatMessage } from "@/prisma/app/generated/prisma/client";
import {
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from "@headlessui/react";
import { UserCircleIcon } from "@heroicons/react/20/solid";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import React, { useEffect } from "react";

interface Affiliate {
	handle: string;
	displayName: string;
	avatar: string;
	platform: "instagram" | "bluesky" | "youtube";
	evaluation: "Yes" | "No";
	tag: string;
	reason: string;
	status: "active" | "inactive";
	interactions?: number;
	channelId?: string;
	videoId?: string;
}

interface TextareaProps {
	affiliates: Affiliate[];
	onAffiliateSelect: (affiliate: Affiliate) => void;
	selectedAffiliate: Affiliate | null;
	message: string;
	onMessageChange: (message: {
		text: string;
		date: Date;
		sender: string;
	}) => void;
	onSendMessage: () => Promise<void>;
	isLoading: boolean;
	chatMessages: ChatMessage[];
	platform: string;
}

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

function getEngagementStatus(messages: ChatMessage[]) {
	if (!messages.length) {
		return {
			stage: "warm_up",
			bgColor: "bg-blue-100",
			textColor: "text-blue-800",
			dotColor: "bg-blue-400",
			label: "Warming Up",
		};
	}

	const latestStatus = messages[0].chat_message_status || "warm_up";

	switch (latestStatus) {
		case "ready":
			return {
				stage: "ready",
				bgColor: "bg-green-100",
				textColor: "text-green-800",
				dotColor: "bg-green-400",
				label: "Ready to Collaborate",
			};
		case "negotiating":
			return {
				stage: "negotiating",
				bgColor: "bg-orange-100",
				textColor: "text-orange-800",
				dotColor: "bg-orange-400",
				label: "Negotiating Terms",
			};
		case "engaged":
			return {
				stage: "engaged",
				bgColor: "bg-yellow-100",
				textColor: "text-yellow-800",
				dotColor: "bg-yellow-400",
				label: "Actively Engaged",
			};
		default:
			return {
				stage: "warm_up",
				bgColor: "bg-blue-100",
				textColor: "text-blue-800",
				dotColor: "bg-blue-400",
				label: "Warming Up",
			};
	}
}

export default function Textarea({
	affiliates,
	onAffiliateSelect,
	selectedAffiliate,
	message,
	onMessageChange,
	onSendMessage,
	isLoading,
	chatMessages,
	platform,
}: TextareaProps) {
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [interactions, setInteractions] = React.useState(0);

	useEffect(() => {
		const interactions = chatMessages.filter(
			(message) => message.receiver === selectedAffiliate?.handle,
		).length;
		setInteractions(interactions);
	}, [chatMessages, selectedAffiliate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			await onSendMessage();
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form action="#" className="relative" onSubmit={handleSubmit}>
			<div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-orange-500">
				<label htmlFor="description" className="sr-only">
					Write your post
				</label>
				<div className="relative">
					<textarea
						rows={3}
						name="description"
						id="description"
						value={isLoading ? "" : message}
						onChange={(e) =>
							onMessageChange({
								text: e.target.value,
								date: new Date(),
								sender: selectedAffiliate?.handle || "",
							})
						}
						disabled={isLoading}
						className={classNames(
							"block w-full resize-none border-0 bg-transparent py-4 px-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6",
							isLoading ? "cursor-not-allowed opacity-50" : "",
						)}
						placeholder="Write your post..."
					/>
					{isLoading && (
						<div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
							<EllipsisHorizontalIcon className="h-8 w-8 text-gray-400 animate-pulse" />
						</div>
					)}
				</div>

				{/* Spacer element to match the height of the toolbar */}
				<div aria-hidden="true">
					<div className="py-2">
						<div className="h-9" />
					</div>
				</div>
			</div>

			<div className="absolute inset-x-px bottom-0">
				<div className="flex items-center justify-between space-x-3 border-t border-gray-200 px-2 py-2 sm:px-3">
					<div className="flex">
						<div className="relative">
							{affiliates.length > 0 ? (
								<Listbox value={selectedAffiliate} onChange={onAffiliateSelect}>
									<ListboxButton className="relative inline-flex items-center gap-x-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100">
										{selectedAffiliate ? (
											<div className="flex items-center gap-x-2">
												<img
													src={selectedAffiliate.avatar}
													alt=""
													className="h-6 w-6 rounded-full"
												/>
												<span className="text-gray-900">
													{selectedAffiliate.displayName}
												</span>
												<img
													src={`/logo-cluster/${platform}${platform.toLowerCase() === "youtube" ? ".jpg" : ".svg"}`}
													alt={platform}
													className="h-4 w-4"
												/>
												{(() => {
													const status = getEngagementStatus(chatMessages);
													return (
														<span
															className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.bgColor} ${status.textColor}`}
														>
															<span
																className={`mr-1 h-1.5 w-1.5 rounded-full ${status.dotColor}`}
															/>
															{status.label}
														</span>
													);
												})()}
											</div>
										) : (
											<>
												<UserCircleIcon
													className="h-6 w-6 text-gray-400"
													aria-hidden="true"
												/>
												<span>Select affiliate</span>
											</>
										)}
									</ListboxButton>

									<ListboxOptions className="absolute left-0 z-10 mt-1 max-h-60 w-60 overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
										{affiliates.map((affiliate) => (
											<ListboxOption
												key={affiliate.handle}
												value={affiliate}
												className={({ active }) =>
													classNames(
														active
															? "bg-orange-50 text-orange-900"
															: "text-gray-900",
														"relative cursor-default select-none py-2 px-3",
													)
												}
											>
												{({ selected, active }) => (
													<div className="flex items-center">
														<img
															src={affiliate.avatar}
															alt=""
															className="h-6 w-6 rounded-full"
														/>
														<span className="ml-3 block truncate font-medium">
															{affiliate.displayName}
														</span>
														<img
															src={`/logo-cluster/${platform}${platform.toLowerCase() === "youtube" ? ".jpg" : ".svg"}`}
															alt={platform}
															className="ml-auto h-4 w-4"
														/>
													</div>
												)}
											</ListboxOption>
										))}
									</ListboxOptions>
								</Listbox>
							) : null}
						</div>
					</div>
					<div className="shrink-0">
						<button
							type="submit"
							disabled={!message.trim() || !selectedAffiliate || isSubmitting}
							className={classNames(
								"inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500",
								!message.trim() || !selectedAffiliate || isSubmitting
									? "bg-orange-300 cursor-not-allowed"
									: "bg-orange-500 hover:bg-orange-600 text-white",
							)}
						>
							{isSubmitting ? (
								<>
									<svg
										className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
									Posting...
								</>
							) : (
								"Post"
							)}
						</button>
					</div>
				</div>
			</div>
		</form>
	);
}
