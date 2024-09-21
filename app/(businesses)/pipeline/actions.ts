"use server";

import { createPipeline } from "@/models/pipeline";
import { revalidatePath } from "next/cache";

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

	revalidatePath("/pipeline/status");

	return pipeline;
}
