"use server";

import type { Affiliate } from "@/app/(businesses)/campaigns/[slug]/campaign";
import { EmailTemplate } from "@/components/mango-ui/email-template";
import { createPipeline, deletePipelineById } from "@/models/pipeline";
import { getProductById } from "@/models/products";
import { createResource } from "@/services/createResource";
import type { RunMode } from "@prisma/client";
import { Redis } from "@upstash/redis";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = new Redis({
	url: UPSTASH_REDIS_REST_URL!,
	token: UPSTASH_REDIS_REST_TOKEN!,
});

export async function deletePipelineAction(id: number) {
	try {
		const result = await deletePipelineById(id);
		if (result?.success) {
			revalidatePath("/campaigns");
			return { success: true };
		}
		return { success: false, error: result.error };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		console.error("Error deleting pipeline:", message);
		return { success: false, error: message };
	}
}

export async function createCampaignAction(data: {
	count: number;
	platform?: string;
	business_id: string;
	product_id: number;
	connected_account_id: string;
	placeId?: string;
	lead?: number;
	click?: number;
	sale?: number;
}) {
	const pipeline = await createPipeline({
		product_id: data.product_id,
		prompt: "prompt",
		affiliate_count: data.count,
		location: data.placeId ? data.placeId : "EARTH",
		business_id: data.business_id,
		workflow: data.platform || "Social Media",
		lead: data.lead,
		click: data.click,
		sale: data.sale,
	});

	const product = await getProductById(data.product_id);
	await createResource({
		content: product?.description as string,
		productId: data.product_id,
	});

	const platform_name = data.platform?.toLowerCase();

	if (platform_name === "bluesky") {
		await fetch(
			`https://www.mangosqueezy.com/api/bluesky/getSearchAffiliates?product_id=${data.product_id}&limit=100&pipeline_id=${pipeline?.id}&affiliate_count=${data.count}`,
			{
				method: "GET",
			},
		);
	} else if (platform_name === "youtube") {
		let url = `https://www.mangosqueezy.com/api/youtube/getSearchAffiliates?product_id=${data.product_id}&limit=100&pipeline_id=${pipeline?.id}&affiliate_count=${data.count}`;
		if (data.placeId) {
			const params = new URLSearchParams({
				place_id: data.placeId,
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
	} else if (platform_name === "stripe") {
		await fetch(
			`https://www.mangosqueezy.com/api/stripe/customers?product_id=${data.product_id}&limit=100&pipeline_id=${pipeline?.id}&affiliate_count=${data.count}&connected_account_id=${data.connected_account_id}`,
			{
				method: "GET",
			},
		);
	}

	const resend = new Resend(process.env.RESEND_API_KEY);
	await resend.emails.send({
		from: "mangosqueezy <amit@tapasom.com>",
		to: ["amit@tapasom.com"],
		subject: `Pipeline created with id ${pipeline?.id}`,
		react: EmailTemplate({
			firstName: "there",
			text: "The user has created the Pipeline job",
		}) as React.ReactElement,
	});

	revalidatePath("/campaigns");

	return pipeline;
}

export async function updateRunModeAction(data: {
	run_mode: RunMode;
	pipeline_id: number;
	email: string;
	handle: string;
	platform: string;
	difficulty: string;
	affiliates: Affiliate[];
}) {
	const parsedAffiliates: Affiliate[] = [];

	for (const affiliate of data.affiliates) {
		parsedAffiliates.push({
			...affiliate,
			runMode:
				(data.platform === "stripe" && affiliate.email === data.email) ||
				(data.platform !== "stripe" && affiliate.handle === data.handle)
					? data.run_mode
					: affiliate.runMode,
		});
	}

	await redis.sadd(data.pipeline_id.toString(), {
		platform: data.platform,
		difficulty: data.difficulty,
		affiliates: parsedAffiliates,
	});

	revalidatePath(`/campaigns/${data.pipeline_id}`);

	return true;
}

export async function getGooglePlacesAction(location: string) {
	const params = new URLSearchParams({
		input: location,
		key: process.env.GOOGLE_MAP_API_KEY!,
		types: "geocode",
		language: "en",
	});

	const response = await fetch(
		`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`,
	);
	const data = await response.json();
	return data;
}
