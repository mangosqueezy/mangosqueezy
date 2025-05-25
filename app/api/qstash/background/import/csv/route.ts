import { getGooglePlacesAction } from "@/app/(businesses)/campaigns/actions";
import { getSubscriptionData } from "@/app/actions";
import {
	getPlanFromPriceId,
	hasFeatureAccess,
	linkMappingSchema,
} from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { Client } from "@upstash/qstash";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeString, sendCsvImportEmails } from "./utils";

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const qstash = new Client({
	token: process.env.QSTASH_TOKEN || "",
});
const redis = new Redis({
	url: UPSTASH_REDIS_REST_URL!,
	token: UPSTASH_REDIS_REST_TOKEN!,
});

export const dynamic = "force-dynamic";

const payloadSchema = z.object({
	userId: z.string(),
	id: z.string(),
	mapping: linkMappingSchema,
});

interface MapperResult {
	success: boolean;
	error?: string;
	data?: {
		campaign_name: string;
		product_name: string;
		product_description: string;
		product_price: string;
		affiliate_count?: string;
		location?: string;
		product_price_type?: string;
		lead?: string;
		click?: string;
		sale?: string;
	};
}

interface ErrorLink {
	domain: string;
	key: string;
	error: string;
}

// POST /api/cron/import/csv
export async function POST(req: Request) {
	try {
		const rawBody = await req.text();

		const payload = payloadSchema.parse(JSON.parse(rawBody));
		const { userId, id } = payload;
		const redisKey = `import:csv:${userId}:${id}`;
		const BATCH_SIZE = 100; // Process 500 links at a time

		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL as string,
			process.env.SUPABASE_KEY as string,
		);

		const { data: businessData, error: BusinessError } = await supabase
			.from("Business")
			.select("stripe_subscription_id")
			.eq("id", userId);

		const stripeSubscriptionId = businessData?.[0]?.stripe_subscription_id;
		const subscription = await getSubscriptionData(
			stripeSubscriptionId as string,
		);
		const plan = getPlanFromPriceId(subscription.price_id);

		const rows = await redis.lpop<Record<string, string>[]>(
			`${redisKey}:rows`,
			BATCH_SIZE,
		);

		if (rows && rows.length > 0) {
			// biome-ignore lint/suspicious/noExplicitAny:
			const mappedProducts: MapperResult[] = rows.map((row: any) =>
				mapCsvRowToLink(row, payload.mapping, plan),
			);

			await processMappedProducts({
				mappedProducts,
				payload,
			});

			await redis.incrby(`${redisKey}:processed`, rows.length);

			if (rows.length === BATCH_SIZE) {
				const response = await qstash.publishJSON({
					url: "https://www.mangosqueezy.com/api/qstash/background/import/csv",
					body: payload,
				});
				return NextResponse.json(response);
			}
		}

		// Finished processing all rows
		const errorLinks = await redis.lrange<ErrorLink>(
			`${redisKey}:failed`,
			0,
			-1,
		);
		const createdCount = Number.parseInt(
			(await redis.get(`${redisKey}:created`)) || "0",
		);
		const campaigns = await redis.smembers(`${redisKey}:campaigns`);

		await sendCsvImportEmails({
			userId,
			count: createdCount,
			campaigns,
			errorLinks,
		});

		await Promise.allSettled([
			redis.del(`${redisKey}:created`),
			redis.del(`${redisKey}:failed`),
			redis.del(`${redisKey}:campaigns`),
			redis.del(`${redisKey}:rows`),
			redis.del(`${redisKey}:processed`),
		]);

		return NextResponse.json("OK");
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}

// Map a CSV row to a link
const mapCsvRowToLink = (
	row: Record<string, string>,
	mapping: z.infer<typeof linkMappingSchema>,
	plan: string,
): MapperResult => {
	try {
		// Helper function to get value from CSV row using case-insensitive matching
		const getValueByKey = (targetKey: string) => {
			const key = Object.keys(row).find(
				(k) => normalizeString(k) === normalizeString(targetKey),
			);

			return key ? row[key].trim() : "";
		};

		const campaignNameValue = getValueByKey(mapping.campaign_name);
		const productNameValue = getValueByKey(mapping.product_name);
		const productDescriptionValue = getValueByKey(mapping.product_description);
		const productPriceValue = getValueByKey(mapping.product_price);

		if (!campaignNameValue) {
			return {
				success: false,
				error: "Missing required field: campaign_name",
			};
		}

		if (!productNameValue) {
			return {
				success: false,
				error: "Missing required field: product_name",
			};
		}

		if (!productDescriptionValue) {
			return {
				success: false,
				error: "Missing required field: product_description",
			};
		}

		if (!productPriceValue) {
			return {
				success: false,
				error: "Missing required field: product_price",
			};
		}

		const productMap: MapperResult["data"] = {
			campaign_name: campaignNameValue,
			product_name: productNameValue,
			product_description: productDescriptionValue,
			product_price: productPriceValue,
		};

		if (mapping.product_price_type) {
			const productPriceType = getValueByKey(mapping.product_price_type);

			if (productPriceType) {
				productMap.product_price_type = productPriceType;
			}
		}

		if (mapping.affiliate_count) {
			const affiliateCount = Number(mapping.affiliate_count);

			const referralLimit = hasFeatureAccess(
				plan,
				"Features",
				"Referrals",
			) as number;

			if (affiliateCount >= referralLimit) {
				return {
					success: false,
					error: "You have reached the maximum number of affiliates.",
				};
			}

			if (affiliateCount) {
				productMap.affiliate_count = affiliateCount.toString();
			}
		}

		if (mapping.location) {
			const location = getValueByKey(mapping.location);

			if (location) {
				productMap.location = location;
			}
		}

		if (mapping.lead) {
			const lead = getValueByKey(mapping.lead);

			if (lead) {
				productMap.lead = lead;
			}
		}

		if (mapping.click) {
			const click = getValueByKey(mapping.click);

			if (click) {
				productMap.click = click;
			}
		}

		if (mapping.sale) {
			const sale = getValueByKey(mapping.sale);

			if (sale) {
				productMap.sale = sale;
			}
		}

		return {
			success: true,
			data: productMap,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
};

// Process the mapped links and create the tag/domain/link in the database
const processMappedProducts = async ({
	mappedProducts,
	payload,
}: {
	mappedProducts: MapperResult[];
	payload: z.infer<typeof payloadSchema>;
}) => {
	const { userId, id } = payload;
	const redisKey = `import:csv:${userId}:${id}`;

	if (mappedProducts.length === 0) {
		return;
	}
	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL as string,
		process.env.SUPABASE_KEY as string,
	);

	// Process the products
	for (const mappedProduct of mappedProducts) {
		const { data, error: productError } = await supabase
			.from("Products")
			.upsert({
				name: mappedProduct.data?.product_name ?? "",
				price: mappedProduct.data?.product_price ?? "",
				description: mappedProduct.data?.product_description ?? "",
				html_description: mappedProduct.data?.product_description ?? "",
				price_type: mappedProduct.data?.product_price_type ?? "OneTime",
			})
			.select();

		if (data) {
			const { data: campaign, error: campaignError } = await supabase
				.from("Pipelines")
				.insert([
					{
						product_id: data[0]?.id,
						business_id: userId,
						prompt: mappedProduct.data?.product_description ?? "",
						affiliate_count: mappedProduct.data?.affiliate_count ?? 1,
						location: mappedProduct.data?.location ?? "US",
						workflow: "youtube",
						lead: Number(mappedProduct.data?.lead) ?? 0,
						click: Number(mappedProduct.data?.click) ?? 0,
						sale: Number(mappedProduct.data?.sale) ?? 0,
					},
				])
				.select();

			if (campaign && campaign.length > 0) {
				if (mappedProduct.data?.campaign_name) {
					await redis.sadd(
						`${redisKey}:campaigns`,
						`${mappedProduct.data?.campaign_name} - ${campaign[0]?.created_at}`,
					);
				}

				await callYoutubeApi({
					productId: data[0]?.id,
					pipelineId: campaign[0]?.id,
					affiliateCount: Number(mappedProduct.data?.affiliate_count) ?? 1,
					place: mappedProduct.data?.location ?? "US",
				});
			}

			if (productError || campaignError) {
				await redis.rpush(`${redisKey}:failed`, {
					domain: mappedProduct.data?.product_name ?? "",
					key: mappedProduct.data?.campaign_name ?? "",
					error: "failed to create campaign",
				});
			}
		}
	}
};

const callYoutubeApi = async ({
	productId,
	pipelineId,
	affiliateCount,
	place,
}: {
	productId: string;
	pipelineId: string;
	affiliateCount: number;
	place: string;
}) => {
	const locations = await getGooglePlacesAction(place);

	let url = `https://www.mangosqueezy.com/api/youtube/getSearchAffiliates?product_id=${productId}&limit=100&pipeline_id=${pipelineId}&affiliate_count=${affiliateCount}`;
	if (locations.predictions.length > 0) {
		const params = new URLSearchParams({
			place_id: locations.predictions[0].place_id,
			key: process.env.GOOGLE_MAP_API_KEY!,
			fields: "geometry",
		});

		const response = await fetch(
			`https://maps.googleapis.com/maps/api/place/details/json?${params}`,
		);

		const geometryResponse = await response.json();

		const location = geometryResponse.result.geometry.location;

		const coordinates = {
			lat: location.lat,
			lng: location.lng,
		};

		if (coordinates) {
			const location = `${coordinates.lat},${coordinates.lng}`;

			url += `&location=${location}&locationRadius=100km`;
		}
	}

	await fetch(url, {
		method: "GET",
	});
};
