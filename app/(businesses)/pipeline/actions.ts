"use server";

import { createPipeline } from "@/models/pipeline";
import { Client } from "@upstash/qstash";
import { revalidatePath } from "next/cache";

const qstashClient = new Client({
	token: process.env.QSTASH_TOKEN as string,
});

export async function createPipelineAction(
	product_id: number,
	prompt: string,
	affiliate_count: number,
	format: string,
	location: string,
	business_id: string,
) {
	const pipeline = await createPipeline({
		product_id,
		prompt,
		affiliate_count,
		format,
		location,
		business_id,
	});

	await qstashClient.publishJSON({
		url: "https://www.mangosqueezy.com/api/qstash/background",
		body: {
			business_id,
			product_id,
			pipeline_id: pipeline?.id,
		},
	});

	revalidatePath("/pipeline/status");

	return pipeline;
}
