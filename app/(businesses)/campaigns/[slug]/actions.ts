"use server";

import { EmailTemplate } from "@/components/mango-ui/email-template";
import { createChatMessage } from "@/models/chat_message";
import { getProductById } from "@/models/products";
import { openai } from "@ai-sdk/openai";
import { Client } from "@upstash/qstash";
import { Redis } from "@upstash/redis";
import { generateText } from "ai";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import type { Affiliate } from "./campaign";

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const redis = new Redis({
	url: UPSTASH_REDIS_REST_URL!,
	token: UPSTASH_REDIS_REST_TOKEN!,
});

const client = new Client({
	token: process.env.QSTASH_TOKEN as string,
});

interface BlueskyPost {
	post: {
		author: {
			handle: string;
		};
	};
}

type YouTubeThumbnail = {
	url: string;
	width?: number;
	height?: number;
};

type YouTubeThumbnails = {
	default: YouTubeThumbnail;
	medium: YouTubeThumbnail;
	high: YouTubeThumbnail;
};

type YouTubeSearchResult = {
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

type YouTubeSearchResponse = {
	items: YouTubeSearchResult[];
};

export interface YouTubeVideoResponse {
	kind: string;
	etag: string;
	items: YouTubeVideo[];
	pageInfo: PageInfo;
}

export interface YouTubeVideo {
	kind: string;
	etag: string;
	id: string;
	snippet: VideoSnippet;
	contentDetails: ContentDetails;
	statistics: Statistics;
}

export interface VideoSnippet {
	publishedAt: string;
	channelId: string;
	title: string;
	description: string;
	thumbnails: {
		default: Thumbnail;
		medium: Thumbnail;
		high: Thumbnail;
		standard: Thumbnail;
		maxres: Thumbnail;
	};
	channelTitle: string;
	tags: string[];
	categoryId: string;
	liveBroadcastContent: string;
	localized: {
		title: string;
		description: string;
	};
}

export interface Thumbnail {
	url: string;
	width: number;
	height: number;
}

export interface ContentDetails {
	duration: string;
	dimension: string;
	definition: string;
	caption: string;
	licensedContent: boolean;
	contentRating: Record<string, unknown>;
	projection: string;
}

export interface Statistics {
	viewCount: string;
	likeCount: string;
	favoriteCount: string;
	commentCount: string;
}

export interface PageInfo {
	totalResults: number;
	resultsPerPage: number;
}

export async function createChatMessageAction(
	pipeline_id: number,
	message: string,
	receiver: string,
) {
	const chatMessage = await createChatMessage({
		pipeline_id,
		text: message,
		sender: "amit@tapasom.com",
		receiver: receiver,
	});

	// temporary email notification
	const resend = new Resend(process.env.RESEND_API_KEY);
	await resend.emails.send({
		from: "mangosqueezy <amit@tapasom.com>",
		to: ["amit@tapasom.com"],
		subject: `New message to ${receiver} for pipeline ${pipeline_id}`,
		react: EmailTemplate({
			firstName: "there",
			text: message,
		}) as React.ReactElement,
	});

	return chatMessage;
}

export async function deleteAffiliateAction(
	pipeline_id: string,
	difficulty: string,
	affiliates: Affiliate[],
	platform: string,
) {
	await redis.spop(pipeline_id);
	await redis.sadd(pipeline_id, {
		platform,
		difficulty,
		affiliates: [...affiliates],
	});

	revalidatePath(`/campaigns/${pipeline_id}`);

	return true;
}

export async function getAffiliatesAction({
	product_id,
	pipeline_id,
	affiliate_count,
	difficulty,
	platform,
}: {
	product_id: string;
	pipeline_id: string;
	affiliate_count: string;
	difficulty: string;
	platform: string;
}) {
	if (platform === "bluesky") {
		await fetch(
			`https://www.mangosqueezy.com/api/bluesky/getSearchAffiliates?product_id=${product_id}&limit=100&pipeline_id=${pipeline_id}&affiliate_count=${affiliate_count}&difficulty=${difficulty}&platform=${platform}`,
			{
				method: "GET",
			},
		);
	} else if (platform === "youtube") {
		await fetch(
			`https://www.mangosqueezy.com/api/youtube/getSearchAffiliates?product_id=${product_id}&limit=100&pipeline_id=${pipeline_id}&affiliate_count=${affiliate_count}&difficulty=${difficulty}&platform=${platform}`,
			{
				method: "GET",
			},
		);
	} else if (platform === "instagram") {
		const product = await getProductById(Number(product_id));

		await client.publishJSON({
			url: "https://mangosqueezy-hono-app-76817065059.us-central1.run.app/api/search-ig-user",
			body: {
				description: product?.description,
				affiliate_count,
				pipeline_id,
				difficulty,
				operation: "single",
			},
		});
	}

	revalidatePath(`/campaigns/${pipeline_id}`);

	return true;
}

export async function getAuthorFeedAction(
	handle: string,
	commissionPercentage: number,
	exampleEarning: number,
	productDescription: string,
) {
	const [feedResponse, profileResponse] = await Promise.all([
		fetch(
			`https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${handle}&filter=posts_no_replies&includePins=false&limit=30`,
		),
		fetch(
			`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${handle}`,
		),
	]);

	const [feedData, profileData] = await Promise.all([
		feedResponse.json(),
		profileResponse.json(),
	]);

	const filteredFeed = feedData?.feed?.filter(
		(post: BlueskyPost) => post.post.author.handle === handle,
	);
	const postContent = filteredFeed?.[0]?.post.record.text;

	const result = await generateDraftPostAction(
		handle,
		postContent,
		productDescription,
		commissionPercentage,
		exampleEarning,
	);

	return {
		feed: filteredFeed,
		result,
		profileData,
	};
}

export async function getInstagramFeedAction(
	handle: string,
	commissionPercentage: number,
	exampleEarning: number,
	productDescription: string,
) {
	const response = await fetch(
		`https://graph.facebook.com/v21.0/17841458398835295?fields=business_discovery.username(${handle}){profile_picture_url,followers_count,media_count,media{caption,media_url,permalink,thumbnail_url,comments_count,like_count,timestamp},name,biography,website}&access_token=${process.env.IG_ACCESS_TOKEN}`,
	);
	const data = await response.json();

	const result = await generateDraftPostAction(
		handle,
		data.business_discovery.media.data[0].caption,
		productDescription,
		commissionPercentage,
		exampleEarning,
	);

	return { data, result };
}

export async function getYoutubeFeedAction(
	handle: string,
	channelId: string,
	commissionPercentage: number,
	exampleEarning: number,
	productDescription: string,
) {
	const response = await fetch(
		`https://youtube.googleapis.com/youtube/v3/channels?part=statistics,snippet&key=${YOUTUBE_API_KEY}&id=${channelId}`,
	);

	const youtubeSearchResponse = await fetch(
		`https://youtube.googleapis.com/youtube/v3/search?part=snippet&key=${YOUTUBE_API_KEY}&type=channel,video,playlist&channelId=${channelId}`,
	);

	const youtubeSearchData: YouTubeSearchResponse =
		await youtubeSearchResponse.json();

	const youtubeSearchItems = youtubeSearchData.items;

	let videoData: YouTubeVideoResponse = {
		items: [],
		kind: "",
		etag: "",
		pageInfo: { totalResults: 0, resultsPerPage: 0 },
	};
	const videoPromises = youtubeSearchItems
		.slice(0, Math.min(youtubeSearchItems.length, 10))
		.map(async (item) => {
			if (item.id.videoId) {
				const youtubeVideoResponse = await fetch(
					`https://youtube.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${item.id.videoId}&key=${YOUTUBE_API_KEY}`,
				);
				return youtubeVideoResponse.json();
			}
			return null;
		});

	const videoResults = await Promise.all(videoPromises);
	const validVideoResults = videoResults.filter(
		(result): result is YouTubeVideoResponse => result !== null,
	);

	if (validVideoResults.length > 0) {
		// Combine all valid video results into a single response
		videoData = {
			kind: validVideoResults[0].kind,
			etag: validVideoResults[0].etag,
			items: validVideoResults.reduce(
				(acc, curr) => acc.concat(curr.items),
				[] as YouTubeVideo[],
			),
			pageInfo: {
				totalResults: validVideoResults.reduce(
					(acc, curr) => acc + curr.pageInfo.totalResults,
					0,
				),
				resultsPerPage: validVideoResults.reduce(
					(acc, curr) => acc + curr.pageInfo.resultsPerPage,
					0,
				),
			},
		};
	}

	const feed = await response.json();
	const data = feed.items;
	const feedVideo = videoData?.items || [];

	const caption = videoData?.items?.[0]?.contentDetails?.caption || "";
	const result = await generateDraftPostAction(
		handle,
		caption,
		productDescription,
		commissionPercentage,
		exampleEarning,
	);

	return { data, result, feedVideo };
}

export async function generateDraftPostAction(
	handle: string,
	postContent: string,
	productDescription: string,
	commissionPercentage: number,
	exampleEarning: number,
	status: "warm" | "cold" = "warm",
	tone: "professional" | "casual" | "friendly" = "professional",
) {
	try {
		let systemPrompt =
			"You are a social media expert who writes friendly, human-like partnership messages. Your goal is to introduce an affiliate program in a genuine and natural way, focusing on the value for the other person, not just your product.";

		let prompt = `Write a warm, personal message inviting ${handle} to join our affiliate program.

Product: ${productDescription}
Commission: ${commissionPercentage}%
Potential Earnings: around $${exampleEarning} per sale.

Make it:
- Simple and clear.
- Friendly and human-sounding.
- Focused on their benefit.
- Ending with a soft invitation to chat or learn more.
`;
		if (status === "warm") {
			prompt = `Here's the post content: "${postContent}"

Write a reply for ${handle} that:
- Feels personal and genuine.
- Shows you understand the post.
- Uses a ${tone} tone.
- Sounds like a real person, not AI.
- Builds a real connection rather than pushing sales.
- Ends with a friendly call to action if suitable.
- The output should not be in the double quotes. Just plain text.`;

			systemPrompt =
				"You are a social media expert who writes authentic, human-like comments and replies for Instagram. Your goal is to help brands build real connections with people by understanding their posts and responding in a friendly, thoughtful way — just like a human social media manager would.";
		}

		const { text } = await generateText({
			model: openai("gpt-4o-mini"),
			system: systemPrompt,
			prompt,
		});

		return text;
	} catch (error) {
		console.error("Error generating draft post:", error);
		throw error;
	}
}
