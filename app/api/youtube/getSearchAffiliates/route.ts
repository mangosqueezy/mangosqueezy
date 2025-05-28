import { getProductById } from "@/models/products";
import type { RunMode } from "@prisma/client";
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
	runMode: RunMode;
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
		const affiliate_count = Number.parseInt(
			searchParams.get("affiliate_count") || "10",
			10,
		);
		const difficulty: string = searchParams.get("difficulty") || "hard";
		const location = searchParams.get("location") || "";
		const locationRadius = searchParams.get("locationRadius") || "100km";

		const product = await getProductById(Number.parseInt(product_id));
		const { keywords: searchKeywords } = await getKeywords({
			description: product?.description || "",
		});

		const validResults: Affiliate[] = [];
		let foundCount = 0;

		for (const keyword of searchKeywords) {
			if (foundCount >= affiliate_count) break;

			const type = location ? "video" : "channel";
			let url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${keyword}&key=${YOUTUBE_API_KEY}&type=${type}&maxResults=30`;
			if (location) {
				url += `&location=${location}&locationRadius=${locationRadius}`;
			}

			const searchResponse = await fetch(url);
			const response: YouTubeSearchResponse = await searchResponse.json();
			const channels = response.items;

			for (const channel of channels) {
				if (foundCount >= affiliate_count) break;

				const channelId = location
					? channel.snippet.channelId
					: channel.id.channelId;
				if (!channelId) continue;

				const detailsUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=statistics,snippet&key=${YOUTUBE_API_KEY}&id=${channelId}`;
				const detailsResponse = await fetch(detailsUrl);
				const detailsJson: YouTubeChannelResponse =
					await detailsResponse.json();
				const channelDetails = detailsJson.items[0];
				if (!channelDetails) continue;

				const metrics = {
					replyCount: 0,
					repostCount: 0,
					likeCount:
						Number.parseInt(channelDetails.statistics.subscriberCount) || 0,
					quoteCount: Number.parseInt(channelDetails.statistics.viewCount) || 0,
				};

				const result = await evalAi({
					handle: channel.snippet.channelTitle,
					postMetrics: metrics,
					difficulty: difficulty as Difficulty,
				});

				if (result.evaluation === "Yes") {
					validResults.push({
						handle: channel.snippet.channelTitle,
						displayName: channelDetails.snippet.title,
						avatar: channelDetails.snippet.thumbnails.default.url,
						channelId,
						videoId: channel.id.videoId,
						status: "active",
						statistics: {
							subscriberCount: channelDetails.statistics.subscriberCount,
							viewCount: channelDetails.statistics.viewCount,
							videoCount: channelDetails.statistics.videoCount,
						},
						runMode: "Manual",
						evaluation: "Yes",
						tag: result.tag,
						reason: result.reason,
					} as Affiliate);
					foundCount++;
				}
			}
		}

		// Remove duplicates by handle before saving
		const uniqueResults = validResults.filter(
			(affiliate, index, self) =>
				self.findIndex((a) => a.handle === affiliate.handle) === index,
		);

		const redisResult = await redis.sadd(pipeline_id, {
			platform: "youtube",
			difficulty,
			affiliates: uniqueResults,
		});

		return NextResponse.json(redisResult, { status: 200 });
	} catch (error) {
		console.error("Error:", error);
		return NextResponse.json(
			{ error: "Something went wrong" },
			{ status: 400 },
		);
	}
}
