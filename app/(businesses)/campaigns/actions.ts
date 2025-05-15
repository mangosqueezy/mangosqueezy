"use server";

import type { Affiliate } from "@/app/(businesses)/campaigns/[slug]/campaign";
import { EmailTemplate } from "@/components/mango-ui/email-template";
import { createPipeline, deletePipelineById } from "@/models/pipeline";
import { getProductById } from "@/models/products";
import type { RunMode } from "@/prisma/app/generated/prisma/client";
import { createResource } from "@/services/createResource";
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
		await deletePipelineById(id);
		revalidatePath("/campaigns");
		return { success: true };
	} catch (error) {
		console.error("Error deleting pipeline:", error);
		return { success: false, error: "Failed to delete pipeline" };
	}
}

export async function createCampaignAction(data: {
	count: number;
	platform?: string;
	business_id: string;
	product_id: number;
	connected_account_id: string;
}) {
	const pipeline = await createPipeline({
		product_id: data.product_id,
		prompt: "prompt",
		affiliate_count: data.count,
		location: "EARTH",
		business_id: data.business_id,
		workflow: data.platform || "Social Media",
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
		await fetch(
			`https://www.mangosqueezy.com/api/youtube/getSearchAffiliates?product_id=${data.product_id}&limit=100&pipeline_id=${pipeline?.id}&affiliate_count=${data.count}`,
			{
				method: "GET",
			},
		);
	} else if (platform_name === "stripe") {
		await fetch(
			`http://www.mangosqueezy.com/api/stripe/customers?product_id=${data.product_id}&limit=100&pipeline_id=${pipeline?.id}&affiliate_count=${data.count}&connected_account_id=${data.connected_account_id}`,
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
