"use client";

import type { StripeAffiliate } from "@/app/api/stripe/customers/route";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { hasFeatureAccess } from "@/lib/utils";
import type { RunMode } from "@prisma/client";
import type { Products } from "@prisma/client";
import type { ChatMessage } from "@prisma/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { ColumnDef } from "@tanstack/react-table";
import { Info, Loader2, MessageCircle, Radio, Settings } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { updateRunModeAction } from "../actions";
import {
	type YouTubePlaylistItem,
	createChatMessageAction,
	deleteAffiliateAction,
	getAffiliatesAction,
	getAuthorFeedAction,
	getInstagramFeedAction,
	getStripeFeedAction,
	getYoutubeFeedAction,
} from "./actions";
import { affiliateColumns, stripeColumns } from "./columns";
import type {
	Affiliate as AffiliateColumnType,
	StripeAffiliate as StripeAffiliateColumnType,
} from "./columns";
import { DataTable } from "./data-table";

const supabase = createClient();

export type YouTubeThumbnail = {
	url: string;
	width?: number;
	height?: number;
};

export type YouTubeThumbnails = {
	default: YouTubeThumbnail;
	medium: YouTubeThumbnail;
	high: YouTubeThumbnail;
};

export type YouTubeSearchResult = {
	kind: string;
	etag: string;
	id: {
		kind: string;
		channelId?: string;
		videoId?: string;
	};
	snippet: {
		publishedAt: string;
		channelId: string;
		title: string;
		description: string;
		thumbnails: YouTubeThumbnails;
		channelTitle: string;
		publishTime: string;
	};
};

export type Affiliate = {
	handle: string;
	channelId?: string;
	videoId?: string;
	displayName: string;
	avatar: string;
	evaluation: "Yes" | "No";
	tag: string;
	reason: string;
	status: "active" | "inactive";
	platform: "instagram" | "bluesky" | "youtube" | "stripe";
	runMode: RunMode;
} & StripeAffiliate;

interface BlueskyPost {
	post: {
		uri: string;
		author: {
			handle: string;
			displayName: string;
			avatar: string;
		};
		record: {
			text: string;
			createdAt: string;
		};
		embed?: {
			$type: string;
			record?: {
				embeds?: Array<{
					$type: string;
					images?: Array<{
						thumb: string;
						fullsize: string;
						alt: string;
						aspectRatio: {
							width: number;
							height: number;
						};
					}>;
				}>;
			};
		};
		replyCount: number;
		repostCount: number;
		likeCount: number;
		quoteCount: number;
		indexedAt: string;
	};
}

interface InstagramPost {
	caption: string;
	media_url: string;
	permalink: string;
	thumbnail_url?: string;
	comments_count: number;
	like_count: number;
	timestamp: string;
	id: string;
}

interface InstagramFeed {
	business_discovery: {
		profile_picture_url: string;
		followers_count: number;
		media_count: number;
		media: {
			data: InstagramPost[];
		};
		name: string;
		biography: string;
		website: string;
	};
}

interface BlueskyProfile {
	did: string;
	handle: string;
	displayName: string;
	avatar: string;
	description: string;
	banner: string;
	followersCount: number;
	followsCount: number;
	postsCount: number;
	indexedAt: string;
}

type BlueskyFeed = BlueskyPost[];

type YouTubeChannel = {
	statistics: {
		viewCount: string;
		subscriberCount: string;
		videoCount: string;
	};
	snippet: {
		title: string;
		description: string;
		thumbnails: YouTubeThumbnails;
	};
};

export type Platform = "instagram" | "bluesky" | "youtube" | "stripe";

export type AffiliateStage = {
	stage: "warm_up" | "engaged" | "negotiating" | "ready" | "inactive";
	progress: number;
	color: string;
	label: string;
};

type InstagramAffiliateDetails = { data: InstagramFeed; result: string };
type BlueskyAffiliateDetails = {
	feed: BlueskyFeed;
	profileData: BlueskyProfile;
	result: string;
};
type YoutubeAffiliateDetails = {
	data: YouTubeChannel[];
	videoId: string;
	result: string;
	feedVideo: YouTubePlaylistItem[];
};

type StripeAffiliateDetails = {
	result: string;
};

type AffiliateDetails =
	| InstagramAffiliateDetails
	| BlueskyAffiliateDetails
	| YoutubeAffiliateDetails
	| StripeAffiliateDetails;

const getAffiliateStage = (messages: ChatMessage[]): AffiliateStage => {
	if (!messages.length) {
		return {
			stage: "warm_up",
			progress: 10,
			color: "bg-blue-500",
			label: "Warming Up",
		};
	}

	const latestStatus = messages[0].chat_message_status || "warm_up";

	switch (latestStatus) {
		case "ready":
			return {
				stage: "ready",
				progress: 100,
				color: "bg-green-500",
				label: "Ready to Collaborate",
			};
		case "negotiating":
			return {
				stage: "negotiating",
				progress: 75,
				color: "bg-orange-500",
				label: "Negotiating Terms",
			};
		case "engaged":
			return {
				stage: "engaged",
				progress: 50,
				color: "bg-yellow-500",
				label: "Actively Engaged",
			};
		default:
			return {
				stage: "warm_up",
				progress: 25,
				color: "bg-blue-500",
				label: "Warming Up",
			};
	}
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
	plan,
}: {
	pipeline_id: number;
	affiliates: Affiliate[];
	product: Products | undefined;
	commission: number;
	chatMessages: ChatMessage[];
	affiliate_count: number;
	difficulty: string;
	platform: Platform;
	plan: string;
}) {
	const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(
		null,
	);
	const [videoId, setVideoId] = useState<string>("");
	const [automatedMode, setAutomatedMode] = useState<RunMode>("Manual");
	const [isAddingAffiliate, setIsAddingAffiliate] = useState(false);
	const [affiliateStage, setAffiliateStage] = useState<AffiliateStage>({
		stage: "warm_up",
		progress: 10,
		color: "bg-blue-500",
		label: "Warming Up",
	});
	const [isSendingMessage, setIsSendingMessage] = useState(false);
	const [cooldown, setCooldown] = useState<number>(0);
	const cooldownInterval = useRef<NodeJS.Timeout | null>(null);
	const [filter, setFilter] = useState("");
	const [sheetOpen, setSheetOpen] = useState(false);
	const [draftMessage, setDraftMessage] = useState("");
	const [isUpdatingRunMode, setIsUpdatingRunMode] = useState(false);
	const [viewingAffiliateHandle, setViewingAffiliateHandle] = useState<
		string | null
	>(null);

	const affiliateStageButtonConfig = {
		warm_up: {
			color: "bg-blue-500 hover:bg-blue-600 text-white",
			message:
				"Awesome! We're starting to build a relationship with this creator. We'll engage with their posts over the next few days and update you when it's time to reach out!",
			label: "Send warm up message",
			status: "Warm up message sent",
		},
		engaged: {
			color: "bg-yellow-500 hover:bg-yellow-600 text-white",
			message:
				"Great! This creator is actively engaging with us. Keep the conversation going and look for opportunities to collaborate.",
			label: "Send engaged message",
			status: "Engaged message sent",
		},
		negotiating: {
			color: "bg-orange-500 hover:bg-orange-600 text-white",
			message:
				"We're negotiating terms with this creator. Stay tuned for updates on the partnership details.",
			label: "Send negotiating message",
			status: "Negotiating message sent",
		},
		ready: {
			color: "bg-green-500 hover:bg-green-600 text-white",
			message:
				"This creator is ready to collaborate! Let's finalize the details and launch the campaign together.",
			label: "Send ready to collaborate message",
			status: "Ready to collaborate message sent",
		},
		inactive: {
			color: "bg-gray-400 text-white cursor-not-allowed",
			message:
				"This creator is currently inactive. You can revisit this relationship later or choose another affiliate.",
			label: "Inactive",
			status: "Inactive",
		},
	};

	useEffect(() => {
		let channel: RealtimeChannel;
		if (pipeline_id) {
			channel = supabase
				.channel("custom-all-channel")
				.on(
					"postgres_changes",
					{
						event: "UPDATE",
						schema: "public",
						table: "Pipelines",
						filter: `id=eq.${pipeline_id}`,
					},
					(payload) => {},
				)
				.subscribe();
		}

		return () => {
			if (channel) {
				supabase.removeChannel(channel);
			}
		};
	}, [pipeline_id]);

	const handleAddAffiliate = useCallback(async () => {
		setIsAddingAffiliate(true);

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
			platform,
		});

		if (platform !== "instagram") {
			setIsAddingAffiliate(false);
		}
	}, [product?.id, pipeline_id, affiliate_count, difficulty, platform]);

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

		setDraftMessage("");
		setSelectedAffiliate(null);
	};

	const relevantMessages = useMemo(() => {
		if (!selectedAffiliate) return [];
		return chatMessages.filter(
			(message) =>
				message.sender === selectedAffiliate.handle ||
				message.receiver === selectedAffiliate.handle,
		);
	}, [selectedAffiliate, chatMessages]);

	useEffect(() => {
		if (selectedAffiliate) {
			setAffiliateStage(getAffiliateStage(relevantMessages));
		}
	}, [selectedAffiliate, relevantMessages]);

	const handleSendMessage = async () => {
		if (draftMessage?.trim()) {
			setIsSendingMessage(true);

			await createChatMessageAction(
				pipeline_id,
				draftMessage,
				selectedAffiliate?.handle as string,
				affiliateStage.stage,
				videoId,
			);
			setIsSendingMessage(false);
			setAffiliateStage(getAffiliateStage(relevantMessages));
		}
	};

	const activeAffiliates = useMemo(
		() => affiliates.filter((affiliate) => affiliate.status === "active"),
		[affiliates],
	);

	const filteredAffiliates = useMemo(() => {
		if (platform === "stripe") {
			return activeAffiliates.filter((affiliate) =>
				affiliate.email.toLowerCase().includes(filter.toLowerCase()),
			);
		}
		return activeAffiliates.filter((affiliate) =>
			affiliate.displayName.toLowerCase().includes(filter.toLowerCase()),
		);
	}, [activeAffiliates, filter, platform]);

	const handleViewAffiliate = async (
		affiliate: Affiliate | (StripeAffiliate & { handle: string }),
	) => {
		setViewingAffiliateHandle(affiliate.handle);
		setSelectedAffiliate(affiliate as Affiliate);
		setAutomatedMode(affiliate?.runMode || "Manual");
		let details: AffiliateDetails | undefined = undefined;
		const price = product?.price || 0;
		const commissionPercentage = commission;
		const exampleEarning = (price * commissionPercentage) / 100;
		if (platform === "bluesky") {
			const { feed, result, profileData } = await getAuthorFeedAction(
				affiliate.handle,
				commissionPercentage,
				exampleEarning,
				product?.description || "",
			);
			details = { feed, profileData, result };
		} else if (platform === "instagram") {
			const { data, result } = await getInstagramFeedAction(
				affiliate.handle,
				commissionPercentage,
				exampleEarning,
				product?.description || "",
			);
			details = { data, result };
		} else if (platform === "youtube") {
			const { result, feedVideo, videoId } = await getYoutubeFeedAction(
				affiliate.handle,
				(affiliate as Affiliate).channelId as string,
				commissionPercentage,
				exampleEarning,
				product?.description || "",
			);
			setVideoId(videoId);
			details = { result, feedVideo, videoId };
		} else if (platform === "stripe") {
			const text = await getStripeFeedAction(
				(affiliate as StripeAffiliate).email as string,
				commissionPercentage,
				exampleEarning,
				product?.description || "",
			);
			details = { result: text };
		}
		setDraftMessage(details?.result || "");
		setSheetOpen(true);
		setViewingAffiliateHandle(null);
	};

	const latestUserMessage = useMemo(() => {
		if (!selectedAffiliate) return null;
		return (
			relevantMessages
				.filter(
					(msg) =>
						msg.sender === "amit@tapasom.com" &&
						msg.receiver === selectedAffiliate.handle,
				)
				.sort(
					(a, b) =>
						new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
				)[0] || null
		);
	}, [relevantMessages, selectedAffiliate]);

	const outreachEnabled = useMemo(
		() => hasFeatureAccess(plan, "Features", "Outreach") as boolean,
		[plan],
	);

	useEffect(() => {
		if (!latestUserMessage) {
			setCooldown(0);
			if (cooldownInterval.current) clearInterval(cooldownInterval.current);
			return;
		}
		const lastSent = new Date(latestUserMessage.created_at).getTime();
		const now = Date.now();
		const diff =
			platform === "stripe"
				? 3 * 24 * 60 * 60 * 1000 - (now - lastSent)
				: 24 * 60 * 60 * 1000 - (now - lastSent);
		if (diff > 0) {
			setCooldown(diff);
			if (cooldownInterval.current) clearInterval(cooldownInterval.current);
			cooldownInterval.current = setInterval(() => {
				setCooldown((prev) => {
					if (prev <= 1000) {
						clearInterval(cooldownInterval.current!);
						return 0;
					}
					return prev - 1000;
				});
			}, 1000);
		} else {
			setCooldown(0);
			if (cooldownInterval.current) clearInterval(cooldownInterval.current);
		}
		return () => {
			if (cooldownInterval.current) clearInterval(cooldownInterval.current);
		};
	}, [latestUserMessage, platform]);

	function formatCooldown(ms: number) {
		const totalSeconds = Math.floor(ms / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		return `${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	}

	return (
		<>
			<Toaster position="top-right" />

			<div className="mb-8">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink
								href="/campaigns"
								className="flex items-center gap-2"
							>
								<Radio className="size-4" />
								Campaigns
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>{`Campaign ${pipeline_id}`}</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
				<div className="flex flex-col sm:flex-row sm:items-center gap-4 my-4">
					<div className="flex items-center gap-2">
						<h3 className="text-lg font-semibold text-gray-900">Affiliates</h3>
						<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
							{activeAffiliates.length} / {affiliate_count}
						</span>
					</div>
				</div>

				{platform === "stripe" ? (
					<DataTable
						columns={
							stripeColumns.map((col) =>
								col.id === "actions"
									? ({
											...col,
											cell: ({ row }) => {
												const original =
													row.original as StripeAffiliateColumnType;
												return (
													<div className="flex gap-2">
														<Button
															variant="outline"
															size="sm"
															onClick={() => original.onRemove?.(original)}
														>
															Remove
														</Button>
														<Button
															variant="default"
															size="sm"
															onClick={() => original.onView?.(original)}
															disabled={
																viewingAffiliateHandle === original.handle
															}
														>
															{viewingAffiliateHandle === original.handle ? (
																<Loader2 className="w-4 h-4 animate-spin" />
															) : (
																"View"
															)}
														</Button>
													</div>
												);
											},
										} as ColumnDef<StripeAffiliateColumnType>)
									: col,
							) as ColumnDef<StripeAffiliateColumnType>[]
						}
						data={filteredAffiliates.map((a) => {
							const handle = a.handle ?? a.email;
							return {
								...a,
								handle,
								onRemove: () => handleDeleteAffiliate(handle),
								onView: () => handleViewAffiliate({ ...a, handle }),
							};
						})}
					/>
				) : (
					<DataTable
						columns={
							affiliateColumns.map((col) =>
								col.id === "actions"
									? ({
											...col,
											cell: ({ row }) => {
												const original = row.original as AffiliateColumnType;
												return (
													<div className="flex gap-2">
														<Button
															variant="outline"
															size="sm"
															onClick={() => original.onRemove?.(original)}
														>
															Remove
														</Button>
														<Button
															variant="default"
															size="sm"
															onClick={() => original.onView?.(original)}
															disabled={
																viewingAffiliateHandle === original.handle
															}
														>
															{viewingAffiliateHandle === original.handle ? (
																<Loader2 className="w-4 h-4 animate-spin" />
															) : (
																"View"
															)}
														</Button>
													</div>
												);
											},
										} as ColumnDef<AffiliateColumnType>)
									: col,
							) as ColumnDef<AffiliateColumnType>[]
						}
						data={filteredAffiliates.map((a) => ({
							...a,
							onRemove: () => handleDeleteAffiliate(a.handle),
							onView: () => handleViewAffiliate(a),
						}))}
					/>
				)}
				<div className="flex justify-end mt-4">
					{activeAffiliates.length < affiliate_count && (
						<button
							type="button"
							onClick={handleAddAffiliate}
							disabled={isAddingAffiliate}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed rounded-md transition-colors"
						>
							{isAddingAffiliate ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="w-4 h-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<title>Add icon</title>
									<path d="M12 5v14M5 12h14" />
								</svg>
							)}
							{isAddingAffiliate ? (
								<span>{`searching on ${platform}...`}</span>
							) : (
								<span>Add New Affiliate</span>
							)}
						</button>
					)}
				</div>
				<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
					<SheetContent className="max-w-lg w-full px-5">
						<ScrollArea className="h-96 md:h-full">
							<SheetHeader className="px-0">
								<SheetTitle>Affiliate Details</SheetTitle>
								<SheetDescription>
									{selectedAffiliate &&
									typeof selectedAffiliate === "object" &&
									"avatar" in selectedAffiliate &&
									"displayName" in selectedAffiliate ? (
										<div className="flex items-center gap-3 mb-4">
											<Image
												src={selectedAffiliate.avatar}
												alt={selectedAffiliate.displayName}
												className="w-10 h-10 rounded-full border"
												width={40}
												height={40}
											/>
											<div>
												<div className="font-semibold text-base">
													{selectedAffiliate.displayName}
												</div>
												<div className="text-xs text-gray-500">
													@{selectedAffiliate.handle}
												</div>
											</div>
										</div>
									) : selectedAffiliate &&
										typeof selectedAffiliate === "object" &&
										"email" in selectedAffiliate ? (
										<div className="flex items-center gap-3 mb-4">
											<div className="font-semibold text-base">
												{(selectedAffiliate as { email: string }).email}
											</div>
										</div>
									) : null}
								</SheetDescription>
							</SheetHeader>

							<div className="flex flex-col items-start gap-1.5 mb-2">
								{automatedMode === "Manual" && (
									<Button
										type="button"
										className={`rounded-lg px-4 py-1 text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 ${affiliateStageButtonConfig[affiliateStage.stage].color}`}
										onClick={() => {
											handleSendMessage();
										}}
										disabled={
											affiliateStage.stage === "inactive" ||
											isSendingMessage ||
											cooldown > 0
										}
									>
										{isSendingMessage ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : (
											<MessageCircle className="w-4 h-4 animate-pulse" />
										)}
										{cooldown > 0
											? `Wait ${formatCooldown(cooldown)}`
											: affiliateStageButtonConfig[affiliateStage.stage].label}
									</Button>
								)}

								<div className="mt-2 text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 w-full shadow-sm transition-all duration-300 ease-in-out flex flex-col gap-2 items-start">
									{automatedMode === "Auto" && relevantMessages.length > 0 && (
										<div className="flex items-center gap-2 text-sm">
											<div
												className={`animate-pulse w-2 h-2 rounded-full ${affiliateStageButtonConfig[affiliateStage.stage].color.replace("bg-", "bg-")}`}
											/>
											<span className="font-medium text-muted-foreground">
												{
													affiliateStageButtonConfig[affiliateStage.stage]
														.status
												}
											</span>
										</div>
									)}
									{relevantMessages.length === 0 ? (
										<span className="flex items-center gap-2 text-gray-400">
											<Info className="w-4 h-4 flex-shrink-0" />
											<span className="font-medium">Not initiated</span>
										</span>
									) : (
										<span className="relative block text-gray-700 min-h-[1.5rem]">
											<Info className="w-4 h-4 absolute left-0 top-0" />
											<span className="pl-6 block text-left w-full leading-tight">
												{
													affiliateStageButtonConfig[affiliateStage.stage]
														.message
												}
											</span>
										</span>
									)}
								</div>
							</div>

							<div className="mb-6">
								<div className="flex items-center justify-between">
									<div className="font-semibold">Messages</div>
									<Popover>
										<PopoverTrigger asChild>
											<Button variant="ghost" size="icon" className="h-8 w-8">
												<Settings className="size-4" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-56">
											<div className="space-y-4">
												<div className="space-y-2 text-sm text-muted-foreground">
													<div className="font-medium text-gray-900">
														Chat Mode
													</div>
													<RadioGroup
														defaultValue={automatedMode}
														onValueChange={(value) => {
															setAutomatedMode(value as RunMode);
														}}
													>
														<div className="flex items-center space-x-2">
															<RadioGroupItem value="Manual" id="Manual" />
															<label htmlFor="Manual">Manual</label>
														</div>
														<div className="flex items-center space-x-2">
															<RadioGroupItem
																value="Auto"
																id="Auto"
																disabled={!outreachEnabled}
															/>
															<label htmlFor="Auto">Automatic</label>
														</div>
													</RadioGroup>
												</div>
												<Button
													size="sm"
													className="w-full"
													onClick={async () => {
														setIsUpdatingRunMode(true);
														try {
															await updateRunModeAction({
																affiliates,
																email: selectedAffiliate?.email ?? "",
																handle: selectedAffiliate?.handle ?? "",
																run_mode: automatedMode,
																platform,
																difficulty,
																pipeline_id: pipeline_id,
															});
															toast.success("Run mode updated");
														} finally {
															setIsUpdatingRunMode(false);
														}
													}}
													disabled={isUpdatingRunMode}
												>
													{isUpdatingRunMode ? (
														<Loader2 className="w-4 h-4 animate-spin mx-auto" />
													) : (
														"Save"
													)}
												</Button>
											</div>
										</PopoverContent>
									</Popover>
								</div>

								{relevantMessages.length === 0 ? (
									<div className="text-gray-400 text-sm">No messages yet.</div>
								) : (
									relevantMessages.map((msg) => (
										<div
											key={
												msg.id ??
												`${msg.sender}-${msg.receiver}-${msg.created_at}`
											}
											className="my-5"
										>
											<div className="text-xs text-gray-500">
												{msg.sender} &rarr; {msg.receiver}
											</div>
											<div className="text-sm text-gray-900">{msg.text}</div>
											<div className="text-xs text-gray-400">
												{new Date(msg.created_at).toLocaleString()}
											</div>
										</div>
									))
								)}
							</div>
						</ScrollArea>
					</SheetContent>
				</Sheet>
			</div>
		</>
	);
}
