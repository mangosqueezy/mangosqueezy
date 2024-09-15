"use server";

import { createPipeline } from "@/models/pipeline";
import { revalidatePath } from "next/cache";

export async function createPipelineAction(
	product_id: number,
	prompt: string,
	affiliate_count: number,
	context: string,
	business_id: string,
) {
	const pipeline = await createPipeline({
		product_id,
		prompt,
		affiliate_count,
		context,
		business_id,
	});

	revalidatePath("/pipeline/status");

	return pipeline;
}
