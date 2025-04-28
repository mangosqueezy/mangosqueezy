"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import type { Products } from "@prisma/client";
import type { ChatMessage } from "@prisma/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
	Heart,
	Info,
	Loader2,
	MessageCircle,
	Quote,
	Repeat2,
} from "lucide-react";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import {
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	type YouTubeVideo,
	createChatMessageAction,
	deleteAffiliateAction,
	getAffiliatesAction,
	getAuthorFeedAction,
	getInstagramFeedAction,
	getYoutubeFeedAction,
} from "./actions";

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
	platform: "instagram" | "bluesky" | "youtube";
};

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

export type Platform = "instagram" | "bluesky" | "youtube";

export type AffiliateStage = {
	stage: "warm_up" | "engaged" | "negotiating" | "ready" | "inactive";
	progress: number;
	color: string;
	label: string;
};

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
}: {
	pipeline_id: number;
	affiliates: Affiliate[];
	product: Products | undefined;
	commission: number;
	chatMessages: ChatMessage[];
	affiliate_count: number;
	difficulty: string;
	platform: Platform;
}) {
	const uniqueId = useId();
	const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(
		null,
	);
	const [messages, setMessages] = useState<{
		sender: string;
		text: string;
		date: Date;
	}>();
	const [isLoading, setIsLoading] = useState(false);
	const [isAddingAffiliate, setIsAddingAffiliate] = useState(false);
	const [jobStatus, setJobStatus] = useState({
		status: "idle",
		message: "",
	});
	const [blueskyFeed, setBlueskyFeed] = useState<BlueskyFeed | null>(null);
	const [youtubeFeed, setYoutubeFeed] = useState<YouTubeVideo[] | null>(null);
	const [youtubeProfile, setYoutubeProfile] = useState<YouTubeChannel[] | null>(
		null,
	);
	const [blueskyProfile, setBlueskyProfile] = useState<BlueskyProfile | null>(
		null,
	);
	const [instagramFeed, setInstagramFeed] = useState<InstagramFeed | null>(
		null,
	);
	const [affiliateStage, setAffiliateStage] = useState<AffiliateStage>({
		stage: "warm_up",
		progress: 10,
		color: "bg-blue-500",
		label: "Warming Up",
	});
	const [showStageMessage, setShowStageMessage] = useState(false);
	const [isSendingMessage, setIsSendingMessage] = useState(false);
	const [cooldown, setCooldown] = useState<number>(0);
	const cooldownInterval = useRef<NodeJS.Timeout | null>(null);

	const affiliateStageButtonConfig = {
		warm_up: {
			color: "bg-blue-500 hover:bg-blue-600 text-white",
			message:
				"Awesome! We're starting to build a relationship with this creator. We'll engage with their posts over the next few days and update you when it's time to reach out!",
			label: "Warming Up",
		},
		engaged: {
			color: "bg-yellow-500 hover:bg-yellow-600 text-white",
			message:
				"Great! This creator is actively engaging with us. Keep the conversation going and look for opportunities to collaborate.",
			label: "Actively Engaged",
		},
		negotiating: {
			color: "bg-orange-500 hover:bg-orange-600 text-white",
			message:
				"We're negotiating terms with this creator. Stay tuned for updates on the partnership details.",
			label: "Negotiating Terms",
		},
		ready: {
			color: "bg-green-500 hover:bg-green-600 text-white",
			message:
				"This creator is ready to collaborate! Let's finalize the details and launch the campaign together.",
			label: "Ready to Collaborate",
		},
		inactive: {
			color: "bg-gray-400 text-white cursor-not-allowed",
			message:
				"This creator is currently inactive. You can revisit this relationship later or choose another affiliate.",
			label: "Inactive",
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
					(payload) => {
						setJobStatus({
							status: payload.new.status,
							message: payload.new.remark,
						});
						setIsLoading(false);
						revalidatePath(`/campaigns/${pipeline_id}`);
					},
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

		if (platform === "instagram") {
			setJobStatus({
				status: "processing",
				message: "Searching for affiliates...",
			});
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

		setSelectedAffiliate(null);
		setBlueskyFeed(null);
		setBlueskyProfile(null);
		setInstagramFeed(null);
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
		if (messages?.text.trim()) {
			setIsSendingMessage(true);
			setMessages({
				sender: "amit@tapasom.com",
				text: messages.text,
				date: new Date(),
			});

			await createChatMessageAction(
				pipeline_id,
				messages.text,
				selectedAffiliate?.handle as string,
			);
			setIsSendingMessage(false);
			setAffiliateStage(getAffiliateStage(relevantMessages));
		}
	};

	const activeAffiliates = useMemo(
		() => affiliates.filter((affiliate) => affiliate.status === "active"),
		[affiliates],
	);

	const handleAffiliateSelect = async (affiliate: Affiliate) => {
		setSelectedAffiliate(affiliate);
		setIsLoading(true);
		setBlueskyFeed(null);
		setInstagramFeed(null);
		setYoutubeFeed(null);
		setYoutubeProfile(null);

		try {
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
				setBlueskyFeed(feed);
				setBlueskyProfile(profileData);
				setMessages({
					sender: "amit@tapasom.com",
					text: result,
					date: new Date(),
				});
			} else if (platform === "instagram") {
				const { data, result } = await getInstagramFeedAction(
					affiliate.handle,
					commissionPercentage,
					exampleEarning,
					product?.description || "",
				);
				setInstagramFeed(data);
				setMessages({
					sender: "amit@tapasom.com",
					text: result,
					date: new Date(),
				});
			} else if (platform === "youtube") {
				const { data, result, feedVideo } = await getYoutubeFeedAction(
					affiliate.handle,
					affiliate.channelId as string,
					commissionPercentage,
					exampleEarning,
					product?.description || "",
				);

				setYoutubeProfile(data);
				setYoutubeFeed(feedVideo);
				setMessages({
					sender: "amit@tapasom.com",
					text: result,
					date: new Date(),
				});
			}
		} catch (error) {
			console.error("Error fetching posts:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Find the latest message sent by the current user to the selected affiliate
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

	// Cooldown effect
	useEffect(() => {
		if (!latestUserMessage) {
			setCooldown(0);
			if (cooldownInterval.current) clearInterval(cooldownInterval.current);
			return;
		}
		const lastSent = new Date(latestUserMessage.created_at).getTime();
		const now = Date.now();
		const diff = 24 * 60 * 60 * 1000 - (now - lastSent);
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
	}, [latestUserMessage]);

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
		<div className="container mx-auto px-4 py-8">
			{/* Product Header */}
			<div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div className="flex flex-col lg:flex-row gap-8 items-center">
					<div className="w-full lg:w-1/4">
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
						<p className="text-gray-700">{product?.description}</p>
					</div>

					<div className="w-full lg:w-1/4 flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
						<div className="text-center mb-4">
							<p className="text-3xl font-bold text-orange-500">
								{commission}%
							</p>
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

			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 w-full gap-4 sm:gap-0">
				<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
					<h3 className="text-lg font-semibold text-gray-900">Affiliates</h3>
					<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
						{activeAffiliates.length} / {affiliate_count}
					</span>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="secondary"
								className="ml-0 sm:ml-2 px-3 py-1.5 text-xs font-medium w-full sm:w-auto"
							>
								{selectedAffiliate ? (
									<span className="flex items-center gap-2">
										<img
											src={selectedAffiliate.avatar}
											alt={selectedAffiliate.displayName}
											className="w-5 h-5 rounded-full"
										/>
										{selectedAffiliate.displayName}
									</span>
								) : (
									"Select Affiliate"
								)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start">
							{activeAffiliates.length === 0 ? (
								<DropdownMenuItem disabled>
									No active affiliates
								</DropdownMenuItem>
							) : (
								activeAffiliates.map((affiliate) => (
									<DropdownMenuItem
										key={affiliate.handle}
										onSelect={() => {
											setSelectedAffiliate(affiliate);
											handleAffiliateSelect(affiliate);
										}}
										className="flex items-center gap-2"
									>
										<span>{affiliate.displayName}</span>
										<Image
											src={`/logo-cluster/${platform}${platform.toLowerCase() === "youtube" ? ".jpg" : ".svg"}`}
											alt={platform}
											width={20}
											height={20}
											className="rounded-full"
										/>
									</DropdownMenuItem>
								))
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
					{selectedAffiliate?.status === "active" && (
						<button
							type="button"
							onClick={() => handleDeleteAffiliate(selectedAffiliate.handle)}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors w-full sm:w-auto"
						>
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
								<title>Delete icon</title>
								<path d="M3 6h18" />
								<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
								<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
							</svg>
							Remove Affiliate
						</button>
					)}
					{activeAffiliates.length < affiliate_count && (
						<button
							type="button"
							onClick={handleAddAffiliate}
							disabled={isAddingAffiliate}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed rounded-md transition-colors w-full sm:w-auto"
						>
							{isAddingAffiliate ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
								</>
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
			</div>

			{/* Social Media Posts Grid */}
			<div className="space-y-6">
				{isLoading ? (
					<div className="flex items-center justify-center py-12 w-full">
						{/* Shimmer cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse"
								>
									<div className="p-4">
										<div className="h-10 w-10 bg-gray-200 rounded-full mb-3" />
										<div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
										<div className="h-3 bg-gray-200 rounded w-1/3 mb-4" />
										<div className="relative aspect-square mb-4 bg-gray-200 rounded-lg" />
										<div className="h-3 bg-gray-200 rounded w-full mb-2" />
										<div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
										<div className="h-3 bg-gray-200 rounded w-1/2" />
									</div>
								</div>
							))}
						</div>
					</div>
				) : selectedAffiliate ? (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{/* Profile Card */}
							<div
								className="relative group"
								key={`profile-card-${selectedAffiliate.handle}-${uniqueId}`}
							>
								<div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 to-orange-100 rounded-lg blur opacity-20 animate-glow" />
								<div
									className={`relative bg-white/30 backdrop-blur-lg rounded-lg border border-gray-200/50 shadow-md overflow-hidden ${platform === "youtube" ? "h-[430px]" : ""}`}
								>
									<div className="relative">
										{/* Banner - using a gradient as placeholder */}
										{platform === "bluesky" && blueskyProfile?.banner ? (
											<div className="h-14 relative">
												<Image
													src={blueskyProfile.banner}
													alt="Profile banner"
													fill
													className="object-cover"
												/>
											</div>
										) : (
											<div className="h-14 bg-gradient-to-r from-orange-400/20 to-pink-500/20" />
										)}

										{/* Profile Section */}
										<div className="px-4 pb-4">
											{/* Avatar */}
											<div className="relative -mt-10 mb-2">
												<div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden">
													<Image
														src={selectedAffiliate?.avatar || ""}
														alt={selectedAffiliate?.displayName || "Profile"}
														width={80}
														height={80}
														className="object-cover"
													/>
												</div>
											</div>

											{/* Profile Info */}
											<div className="space-y-2.5">
												<div>
													<h2 className="text-lg font-bold text-gray-900">
														{selectedAffiliate?.displayName}
													</h2>
													<p className="text-sm text-gray-500">
														@{selectedAffiliate?.handle}
													</p>
												</div>

												{/* Add this after the Profile Info section, before Stats Grid */}
												{selectedAffiliate && (
													<div className="mb-4">
														<div className="flex items-center justify-between mb-2">
															<span className="text-sm font-medium text-gray-700">
																Engagement Progress
															</span>
															<span
																className="text-sm font-medium"
																style={{ color: affiliateStage.color }}
															>
																{affiliateStage.progress}%
															</span>
														</div>
														<div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
															<div
																className={`h-full ${affiliateStage.color} transition-all duration-500 ease-in-out`}
																style={{ width: `${affiliateStage.progress}%` }}
															/>
														</div>
														<div className="mt-1 flex items-center gap-1.5">
															<div
																className={`w-1.5 h-1.5 rounded-full ${affiliateStage.color} animate-pulse`}
															/>
															<span className="text-xs text-gray-600">
																{affiliateStage.label}
															</span>
														</div>
													</div>
												)}

												{/* Stats Grid */}
												<div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-100">
													{platform === "instagram" && instagramFeed && (
														<>
															<div className="text-center">
																<p className="text-base font-semibold text-gray-900">
																	{instagramFeed.business_discovery.followers_count.toLocaleString()}
																</p>
																<p className="text-xs text-gray-500">
																	Followers
																</p>
															</div>
															<div className="text-center">
																<p className="text-base font-semibold text-gray-900">
																	{instagramFeed.business_discovery.media_count.toLocaleString()}
																</p>
																<p className="text-xs text-gray-500">Posts</p>
															</div>
															<div className="text-center">
																<p className="text-base font-semibold text-gray-900">
																	{commission}%
																</p>
																<p className="text-xs text-gray-500">
																	Commission
																</p>
															</div>
														</>
													)}
													{platform === "bluesky" && blueskyProfile && (
														<>
															<div className="text-center">
																<p className="text-base font-semibold text-gray-900">
																	{blueskyProfile.followersCount.toLocaleString()}
																</p>
																<p className="text-xs text-gray-500">
																	Followers
																</p>
															</div>
															<div className="text-center">
																<p className="text-base font-semibold text-gray-900">
																	{blueskyProfile.postsCount.toLocaleString()}
																</p>
																<p className="text-xs text-gray-500">Posts</p>
															</div>
															<div className="text-center">
																<p className="text-base font-semibold text-gray-900">
																	{commission}%
																</p>
																<p className="text-xs text-gray-500">
																	Commission
																</p>
															</div>
														</>
													)}
													{platform === "youtube" &&
														youtubeProfile &&
														youtubeFeed && (
															<>
																<div className="text-center">
																	<p className="text-base font-semibold text-gray-900">
																		{youtubeProfile[0].statistics
																			.subscriberCount || "-"}
																	</p>
																	<p className="text-xs text-gray-500">
																		Subscribers
																	</p>
																</div>
																<div className="text-center">
																	<p className="text-base font-semibold text-gray-900">
																		{youtubeProfile[0].statistics.videoCount ||
																			"-"}
																	</p>
																	<p className="text-xs text-gray-500">
																		Videos
																	</p>
																</div>
																<div className="text-center">
																	<p className="text-base font-semibold text-gray-900">
																		{commission}%
																	</p>
																	<p className="text-xs text-gray-500">
																		Commission
																	</p>
																</div>
															</>
														)}
												</div>

												{/* Bio Section */}
												<div>
													<h3 className="text-sm font-medium text-gray-900 mb-1">
														Bio
													</h3>
													{platform === "instagram" && instagramFeed ? (
														<p className="text-sm text-gray-700 line-clamp-2">
															{instagramFeed.business_discovery.biography}
														</p>
													) : platform === "bluesky" && blueskyProfile ? (
														<p className="text-sm text-gray-700 line-clamp-2">
															{blueskyProfile.description}
														</p>
													) : platform === "youtube" && youtubeFeed ? (
														<p className="text-sm text-gray-700 line-clamp-2">
															{youtubeFeed[0].snippet.description}
														</p>
													) : (
														<div className="h-3 bg-gray-200/50 rounded animate-pulse" />
													)}
												</div>

												{/* Send Affiliate Message Button */}
												<div className="flex flex-col items-start gap-1.5 mt-2">
													<Button
														type="button"
														className={`rounded-lg px-4 py-1 mt-2 text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 ${affiliateStageButtonConfig[affiliateStage.stage].color}`}
														onClick={() => {
															handleSendMessage();
															setShowStageMessage((prev) => !prev);
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
															: affiliateStageButtonConfig[affiliateStage.stage]
																	.label}
													</Button>
													<div
														className={
															"mt-2 text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 w-full shadow-sm transition-all duration-300 ease-in-out flex items-start gap-2"
														}
													>
														{relevantMessages.length === 0 ? (
															<span className="flex items-center gap-2 text-gray-400">
																<Info className="w-4 h-4 flex-shrink-0" />
																<span className="font-medium">
																	Not initiated
																</span>
															</span>
														) : (
															<span className="relative block text-gray-700 min-h-[1.5rem]">
																<Info className="w-4 h-4 absolute left-0 top-0" />
																<span className="pl-6 block text-left w-full leading-tight">
																	{
																		affiliateStageButtonConfig[
																			affiliateStage.stage
																		].message
																	}
																</span>
															</span>
														)}
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							{platform === "bluesky" &&
								blueskyFeed?.map((item: BlueskyPost) => (
									<div
										key={item.post.uri}
										className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
									>
										<div className="p-4">
											<div className="flex items-center gap-3 mb-3">
												<img
													src={item.post.author.avatar}
													alt={item.post.author.displayName}
													className="w-10 h-10 rounded-full"
												/>
												<div>
													<p className="font-medium text-gray-900">
														{item.post.author.displayName}
													</p>
													<p className="text-sm text-gray-500">
														@{item.post.author.handle}
													</p>
												</div>
											</div>

											<p className="text-gray-900 text-sm mb-4">
												{item.post.record.text}
											</p>

											{item.post.embed?.record?.embeds?.[0]?.$type ===
												"app.bsky.embed.images#view" && (
												<div className="relative aspect-square mb-4">
													<Image
														src={
															item.post.embed.record.embeds[0].images?.[0]
																.fullsize || ""
														}
														alt="Post image"
														fill
														className="object-cover rounded-lg"
													/>
												</div>
											)}

											<div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
												<div className="flex items-center gap-4">
													<div className="flex items-center gap-1">
														<MessageCircle className="w-4 h-4" />
														<span>{item.post.replyCount}</span>
													</div>
													<div className="flex items-center gap-1">
														<Repeat2 className="w-4 h-4" />
														<span>{item.post.repostCount}</span>
													</div>
													<div className="flex items-center gap-1">
														<Heart className="w-4 h-4" />
														<span>{item.post.likeCount}</span>
													</div>
													<div className="flex items-center gap-1">
														<Quote className="w-4 h-4" />
														<span>{item.post.quoteCount}</span>
													</div>
												</div>
												<time className="text-xs">
													{formatDate(item.post.indexedAt)}
												</time>
											</div>
										</div>
									</div>
								))}

							{platform === "instagram" &&
								instagramFeed?.business_discovery.media.data.map((post) => (
									<div
										key={post.id}
										className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
									>
										<div className="p-4">
											<div className="flex items-center gap-3 mb-3">
												<img
													src={
														instagramFeed.business_discovery.profile_picture_url
													}
													alt={instagramFeed.business_discovery.name}
													className="w-10 h-10 rounded-full"
												/>
												<div>
													<p className="font-medium text-gray-900">
														{instagramFeed.business_discovery.name}
													</p>
													<p className="text-sm text-gray-500">
														{instagramFeed.business_discovery.followers_count}{" "}
														followers
													</p>
												</div>
											</div>

											<div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
												<Image
													src={post.thumbnail_url || post.media_url}
													alt="Instagram post"
													fill
													className="object-cover"
												/>
											</div>

											<p className="text-gray-900 text-sm mb-4 line-clamp-3">
												{post.caption}
											</p>

											<div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
												<div className="flex items-center gap-4">
													<div className="flex items-center gap-1">
														<Heart className="w-4 h-4" />
														<span>{post.like_count}</span>
													</div>
													<div className="flex items-center gap-1">
														<MessageCircle className="w-4 h-4" />
														<span>{post.comments_count}</span>
													</div>
												</div>
												<time className="text-xs">
													{formatDate(post.timestamp)}
												</time>
											</div>
										</div>
									</div>
								))}

							{platform === "youtube" &&
								youtubeFeed?.map((item) => (
									<div
										key={item.id}
										className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${platform === "youtube" ? "h-[430px]" : ""}`}
									>
										<div className="p-4">
											<div className="flex items-center gap-3 mb-3">
												<img
													src={item.snippet.thumbnails.default.url}
													alt={item.snippet.channelTitle}
													className="w-10 h-10 rounded-full"
												/>
												<div>
													<p className="font-medium text-gray-900">
														{item.snippet.channelTitle}
													</p>
													<p className="text-sm text-gray-500">
														@{selectedAffiliate?.handle}
													</p>
												</div>
											</div>

											<div className="relative aspect-video mb-4 bg-gray-100 rounded-lg overflow-hidden">
												<Image
													src={item.snippet.thumbnails.high.url}
													alt="YouTube thumbnail"
													fill
													className="object-cover"
												/>
											</div>

											<div className="relative aspect-video mb-4 h-48">
												<iframe
													src={`https://www.youtube.com/embed/${item.id}`}
													title={item.snippet.title}
													allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
													allowFullScreen
													className="absolute top-0 left-0 w-full h-full rounded-lg"
												/>
											</div>

											<p className="text-gray-900 text-sm mb-4 line-clamp-3">
												{item.snippet.description}
											</p>

											<div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
												<div className="flex items-center gap-4">
													<div className="flex items-center gap-1">
														<MessageCircle className="w-4 h-4" />
														<span>{item.statistics?.commentCount || "-"}</span>
													</div>
													<div className="flex items-center gap-1">
														<Heart className="w-4 h-4" />
														<span>{item.statistics?.likeCount || "-"}</span>
													</div>
												</div>
												<time className="text-xs">
													{formatDate(item.snippet.publishedAt)}
												</time>
											</div>
										</div>
									</div>
								))}
						</div>
					</>
				) : affiliates.length === 0 ? (
					<div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
						<p className="text-gray-500">
							No affiliates found for this campaign
						</p>
					</div>
				) : (
					<div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Select an Affiliate
						</h3>
						<p className="text-gray-500">
							Choose an affiliate to view their recent posts
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
