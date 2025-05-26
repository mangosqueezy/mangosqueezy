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
import { createClient } from "@/lib/supabase/client";
import { hasFeatureAccess } from "@/lib/utils";
import type { RunMode } from "@prisma/client";
import type { Products } from "@prisma/client";
import type { ChatMessage } from "@prisma/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Radio } from "lucide-react";
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
import LeadDetailsPage from "./lead";

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
	const [leadDetailsOpen, setLeadDetailsOpen] = useState(false);
	const [draftMessage, setDraftMessage] = useState("");
	const [isUpdatingRunMode, setIsUpdatingRunMode] = useState(false);
	const [viewingAffiliateHandle, setViewingAffiliateHandle] = useState<
		string | null
	>(null);

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
		setLeadDetailsOpen(true);
		setViewingAffiliateHandle(null);
	};

	const handleRunModeHandler = useCallback(async () => {
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
	}, [
		selectedAffiliate,
		automatedMode,
		platform,
		difficulty,
		pipeline_id,
		affiliates,
	]);

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

				{leadDetailsOpen ? (
					<LeadDetailsPage
						handleSendMessage={handleSendMessage}
						isSendingMessage={isSendingMessage}
						cooldown={cooldown}
						onOpenChange={setLeadDetailsOpen}
						selectedAffiliate={selectedAffiliate}
						affiliateStage={affiliateStage}
						relevantMessages={relevantMessages}
						outreachEnabled={outreachEnabled}
						formatCooldown={formatCooldown}
						handleRunModeHandler={handleRunModeHandler}
						isUpdatingRunMode={isUpdatingRunMode}
					/>
				) : (
					<>
						<div className="flex flex-col sm:flex-row sm:items-center gap-4 my-4">
							<div className="flex items-center gap-2">
								<h3 className="text-lg font-semibold text-gray-900">
									Affiliates
								</h3>
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
																	{viewingAffiliateHandle ===
																	original.handle ? (
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
														const original =
															row.original as AffiliateColumnType;
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
																	{viewingAffiliateHandle ===
																	original.handle ? (
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
					</>
				)}
			</div>
		</>
	);
}
