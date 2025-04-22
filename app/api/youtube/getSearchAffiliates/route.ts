import { getProductById } from "@/models/products";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { type Difficulty, evalAi } from "./evalAi";
import { getKeywords } from "./getKeywords";

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const redis = new Redis({
	url: UPSTASH_REDIS_REST_URL!,
	token: UPSTASH_REDIS_REST_TOKEN!,
});

export type Affiliate = {
	handle: string;
	displayName: string;
	avatar: string;
	channelId: string;
	videoId?: string;
	evaluation: "Yes" | "No";
	tag: string;
	reason: string;
	status: "active" | "inactive";
	statistics?: {
		subscriberCount: string;
		viewCount: string;
		videoCount: string;
	};
};

export type potentialAffiliates = {
	difficulty: string;
	affiliates: Affiliate[];
};

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

type YouTubeChannelResponse = {
	items: YouTubeChannel[];
};

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const product_id = searchParams.get("product_id") || "";
		const pipeline_id = searchParams.get("pipeline_id") || "";
		const affiliate_count = searchParams.get("affiliate_count") || "10";
		const difficulty: string = searchParams.get("difficulty") || "hard";
		const channels: YouTubeSearchResult[] = [];

		const product = await getProductById(Number.parseInt(product_id));
		const { keywords: searchKeywords } = await getKeywords({
			description: product?.description || "",
		});

		// Search for channels based on keywords
		for (const keyword of searchKeywords) {
			const searchResponse = await fetch(
				`https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${keyword}&key=${YOUTUBE_API_KEY}&type=channel&maxResults=20`,
			);
			const response: YouTubeSearchResponse = await searchResponse.json();
			channels.push(...response.items);
		}

		// Get channel details and evaluate them
		const channelDetailsResponses = await Promise.allSettled(
			channels.map((channel) =>
				fetch(
					`https://youtube.googleapis.com/youtube/v3/channels?part=statistics,snippet&key=${YOUTUBE_API_KEY}&id=${channel.id.channelId}`,
				),
			),
		);

		const channelDetails = (
			await Promise.allSettled(
				channelDetailsResponses
					.filter((response) => response.status === "fulfilled")
					.map((response) =>
						(response as PromiseFulfilledResult<Response>).value.json(),
					),
			)
		)
			.filter((result) => result.status === "fulfilled")
			.map(
				(result) =>
					(result as PromiseFulfilledResult<YouTubeChannelResponse>).value,
			);

		const evaluationResults = await Promise.all(
			channelDetails.map(async (details, index) => {
				const channel = details.items[0];
				if (!channel) return null;

				const metrics = {
					replyCount: 0,
					repostCount: 0,
					likeCount: Number.parseInt(channel.statistics.subscriberCount) || 0,
					quoteCount: Number.parseInt(channel.statistics.viewCount) || 0,
				};

				const result = await evalAi({
					handle: channels[index].snippet.channelTitle,
					postMetrics: metrics,
					difficulty: difficulty as Difficulty,
				});

				return {
					handle: channels[index].snippet.channelTitle,
					displayName: channel.snippet.title,
					avatar: channel.snippet.thumbnails.default.url,
					channelId: channels[index].id.channelId,
					videoId: channels[index].id.videoId,
					status: "active",
					statistics: {
						subscriberCount: channel.statistics.subscriberCount,
						viewCount: channel.statistics.viewCount,
						videoCount: channel.statistics.videoCount,
					},
					...result,
				};
			}),
		);

		// Filter out null results and those that don't meet criteria
		const validResults = evaluationResults
			.filter((result): result is NonNullable<typeof result> => result !== null)
			.filter((result) => result.evaluation === "Yes")
			.slice(0, Number.parseInt(affiliate_count));

		// Store results in Redis
		const result = await redis.sadd(pipeline_id, {
			platform: "youtube",
			difficulty,
			affiliates: validResults,
		});

		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		console.error("Error:", error);
		return NextResponse.json(
			{ error: "Something went wrong" },
			{ status: 400 },
		);
	}
}
