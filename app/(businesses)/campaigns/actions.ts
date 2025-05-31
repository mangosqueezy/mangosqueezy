"use server";

import type { Affiliate } from "@/app/(businesses)/campaigns/[slug]/campaign";
import { createPipeline, deletePipelineById } from "@/models/pipeline";
import { getProductById } from "@/models/products";
import { createResource } from "@/services/createResource";
import type { RunMode } from "@prisma/client";
import { Redis } from "@upstash/redis";
import { Client as WorkflowClient } from "@upstash/workflow";
import { revalidatePath } from "next/cache";

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = new Redis({
	url: UPSTASH_REDIS_REST_URL!,
	token: UPSTASH_REDIS_REST_TOKEN!,
});

const workflowClient = new WorkflowClient({
	token: process.env.QSTASH_TOKEN as string,
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
	email: string;
}) {
	const inputParameters = {
		product_id: data.product_id,
		prompt: "prompt",
		affiliate_count: data.count,
		location: data.placeId ? data.placeId : "EARTH",
		business_id: data.business_id,
		workflow: data.platform || "Social Media",
		lead: data.lead,
		click: data.click,
		sale: data.sale,
	};

	const product = await getProductById(data.product_id);
	await createResource({
		content: product?.description as string,
		productId: data.product_id,
	});

	const platform_name = data.platform?.toLowerCase();
	let locationWithCoordinates = "";
	let upstashWorkflowRunId = "";

	if (platform_name === "bluesky") {
		const pipeline = await createPipeline(inputParameters);
		await fetch(
			`https://www.mangosqueezy.com/api/bluesky/getSearchAffiliates?product_id=${data.product_id}&limit=100&pipeline_id=${pipeline?.id}&affiliate_count=${data.count}`,
			{
				method: "GET",
			},
		);
	} else if (platform_name === "youtube") {
		const pipeline = await createPipeline(inputParameters);
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
				locationWithCoordinates = `${coordinates.lat},${coordinates.lng}`;
			}
		}

		const { workflowRunId } = await workflowClient.trigger({
			url: "https://www.mangosqueezy.com/api/workflow",
			body: {
				product_id: data.product_id,
				pipeline_id: pipeline?.id,
				affiliate_count: data.count,
				difficulty: "EASY",
				platform: "youtube",
				location: locationWithCoordinates,
				locationRadius: "100km",
				email: data.email,
				business_id: data.business_id,
				lead: data.lead,
				click: data.click,
				sale: data.sale,
				type: "create-pipeline",
			},
			headers: {
				"Content-Type": "application/json",
			},
			retries: 3,
		});

		upstashWorkflowRunId = workflowRunId;
	} else if (platform_name === "stripe") {
		const pipeline = await createPipeline(inputParameters);
		await fetch(
			`https://www.mangosqueezy.com/api/stripe/customers?product_id=${data.product_id}&limit=100&pipeline_id=${pipeline?.id}&affiliate_count=${data.count}&connected_account_id=${data.connected_account_id}`,
			{
				method: "GET",
			},
		);
	}

	revalidatePath("/campaigns");

	return { upstashWorkflowRunId };
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
