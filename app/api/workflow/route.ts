import { EmailTemplate } from "@/components/mango-ui/email-template";
import { createPipeline } from "@/models/pipeline";
import { getProductById } from "@/models/products";
import type { RunMode } from "@prisma/client";
import { Redis } from "@upstash/redis";
import { serve } from "@upstash/workflow/nextjs";
import { Resend } from "resend";
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

type Input = {
	product_id: number;
	pipeline_id: number;
	affiliate_count: number;
	difficulty: string;
	platform: string;
	location?: string;
	locationRadius?: string;
	email: string;
	business_id: string;
	lead: number;
	click: number;
	sale: number;
	type: string;
};

export const { POST } = serve(
	async (context) => {
		const input = context.requestPayload as Input;

		const pipeline = await context.run("create-pipeline", async () => {
			if (input.type === "create-pipeline") {
				const inputParameters = {
					product_id: input.product_id,
					prompt: "prompt",
					affiliate_count: input.affiliate_count,
					location: input.location ? input.location : "EARTH",
					locationRadius: input.locationRadius ? input.locationRadius : "100km",
					business_id: input.business_id,
					workflow: input.platform || "Social Media",
					lead: input.lead,
					click: input.click,
					sale: input.sale,
				};
				const pipeline = await createPipeline(inputParameters);
				return pipeline;
			}
		});

		const result = await context.run("call-youtube-api", async () => {
			try {
				const product_id = input.product_id;
				const pipeline_id = pipeline?.id || input.pipeline_id;
				const affiliate_count = input.affiliate_count;
				const difficulty: string = input.difficulty;
				const location = input.location;
				const locationRadius = input.locationRadius;

				const product = await getProductById(product_id);
				const { keywords: searchKeywords } = await getKeywords({
					description: product?.description || "",
				});

				const validResults: Affiliate[] = [];
				let foundCount = 0;

				const affiliatesFromRedis = (await redis.smembers(
					pipeline_id.toString(),
				)) as potentialAffiliates[];
				const potentialAffiliates = affiliatesFromRedis[0]?.affiliates
					? (affiliatesFromRedis[0].affiliates as unknown as Affiliate[])
					: [];

				const activePotentialAffiliates = potentialAffiliates.filter(
					(affiliate) => affiliate.status === "active",
				);

				foundCount = activePotentialAffiliates?.length || 0;

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

						const handle = channel.snippet.channelTitle;
						const channelId = location
							? channel.snippet.channelId
							: channel.id.channelId;
						if (!channelId) continue;

						// Skip if already evaluated
						if (validResults.some((a) => a.handle === handle)) {
							continue;
						}

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
							quoteCount:
								Number.parseInt(channelDetails.statistics.viewCount) || 0,
						};

						const result = await evalAi({
							handle,
							postMetrics: metrics,
							difficulty: difficulty as Difficulty,
						});

						if (result.evaluation === "Yes") {
							if (potentialAffiliates.length > 0) {
								if (
									potentialAffiliates.some(
										(potentialAffiliate) =>
											potentialAffiliate.handle ===
											channel.snippet.channelTitle,
									)
								) {
									continue;
								}
							}

							validResults.push({
								handle,
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

				const mergedResults = [...potentialAffiliates, ...validResults];

				// Remove duplicates by handle before saving
				const uniqueResults = mergedResults.filter(
					(affiliate, index, self) =>
						self.findIndex((a) => a.handle === affiliate.handle) === index,
				);

				await redis.spop(pipeline_id.toString());
				const redisResult = await redis.sadd(pipeline_id.toString(), {
					platform: "youtube",
					difficulty,
					affiliates: uniqueResults,
				});

				return redisResult;
			} catch (_) {
				return 0;
			}
		});

		await context.run("send-email", async () => {
			const resend = new Resend(process.env.RESEND_API_KEY);
			const pipeline_id = pipeline?.id || input.pipeline_id;
			if (result) {
				await resend.emails.send({
					from: "mangosqueezy <amit@tapasom.com>",
					to: [input.email],
					subject: `[mangoSqueezy] Your campaign with id ${pipeline_id} is ready`,
					react: EmailTemplate({
						firstName: "there",
						text: "Your campaign is ready",
					}) as React.ReactElement,
				});
			} else {
				await resend.emails.send({
					from: "mangosqueezy <amit@tapasom.com>",
					to: [input.email],
					subject: `[mangoSqueezy] Your campaign with id ${pipeline_id} is failed`,
					react: EmailTemplate({
						firstName: "there",
						text: "Your campaign is failed, We are working on it",
					}) as React.ReactElement,
				});
			}
		});
	},
	{
		baseUrl:
			process.env.NODE_ENV === "development"
				? process.env.UPSTASH_WORKFLOW_URL
				: undefined,
	},
);
