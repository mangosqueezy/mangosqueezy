"use client";

import Textarea from "@/components/mango-ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { Products } from "@prisma/client";
import type { ChatMessage } from "@prisma/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Heart, Loader2, MessageCircle, Quote, Repeat2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import {
	createChatMessageAction,
	deleteAffiliateAction,
	getAffiliatesAction,
	getAuthorFeedAction,
	getInstagramFeedAction,
} from "./actions";

const supabase = createClient();

export type Affiliate = {
	handle: string;
	displayName: string;
	avatar: string;
	evaluation: "Yes" | "No";
	tag: string;
	reason: string;
	status: "active" | "inactive";
	platform: "instagram" | "bluesky";
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
	const [jobStatus, setJobStatus] = useState({
		status: "idle",
		message: "",
	});
	const [blueskyFeed, setBlueskyFeed] = useState<BlueskyFeed | null>(null);
	const [blueskyProfile, setBlueskyProfile] = useState<BlueskyProfile | null>(
		null,
	);
	const [instagramFeed, setInstagramFeed] = useState<InstagramFeed | null>(
		null,
	);

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
		setIsLoading(true);

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
			setIsLoading(false);
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
	};

	const handleSendMessage = async () => {
		if (messages?.text.trim()) {
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
			// setMessages(messages);
		}
	}, [chatMessages, selectedAffiliate]);

	const handleAffiliateSelect = async (affiliate: Affiliate) => {
		setSelectedAffiliate(affiliate);
		setIsLoading(true);
		setBlueskyFeed(null);
		setInstagramFeed(null);

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

			{/* Textarea Component */}
			<div className="mb-8">
				<Textarea
					affiliates={activeAffiliates}
					selectedAffiliate={selectedAffiliate}
					onAffiliateSelect={handleAffiliateSelect}
					message={messages?.text || ""}
					onMessageChange={setMessages}
					onSendMessage={handleSendMessage}
					isLoading={isLoading}
					chatMessages={chatMessages}
				/>
			</div>

			{/* Social Media Posts Grid */}
			<div className="space-y-6">
				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
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
								<div className="relative bg-white/30 backdrop-blur-lg rounded-lg border border-gray-200/50 shadow-md overflow-hidden">
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
													) : (
														<div className="h-3 bg-gray-200/50 rounded animate-pulse" />
													)}
												</div>

												{/* Affiliate Status */}
												<div className="flex items-center gap-1.5 mt-2">
													<div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
													<span className="text-xs text-gray-600">
														{selectedAffiliate?.status === "active"
															? "Not confirmed"
															: "Pending Confirmation"}
													</span>
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
						</div>
					</>
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
