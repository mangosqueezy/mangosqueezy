"use server";

import { EmailTemplate } from "@/components/mango-ui/email-template";
import {
	createPipeline,
	getPipelineByProductIdAndBusinessId,
} from "@/models/pipeline";
import { getProductById } from "@/models/products";
import { createResource } from "@/services/createResource";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

export async function createPipelineAction(
	product_id: number,
	prompt: string,
	affiliate_count: number,
	location: string,
	business_id: string,
	platform: string,
) {
	const pipeline = await createPipeline({
		product_id,
		prompt,
		affiliate_count,
		location,
		business_id,
	});

	const product = await getProductById(product_id);
	await createResource({
		content: product?.description as string,
		productId: product_id,
	});

	const platform_name = platform.toLowerCase();

	if (platform_name === "instagram") {
		await fetch(
			`https://www.mangosqueezy.com/api/instagram/search-ig-user?description=${product?.description}&affiliate_count=${affiliate_count}&pipeline_id=${pipeline?.id}`,
			{
				method: "GET",
			},
		);
	} else if (platform_name === "bluesky") {
		await fetch(
			`https://www.mangosqueezy.com/api/bluesky/getSearchAffiliates?product_id=${product_id}&limit=100&pipeline_id=${pipeline?.id}&affiliate_count=${affiliate_count}`,
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

export async function getPipelineByProductIdAndBusinessIdAction(
	product_id: number,
	business_id: string,
) {
	const pipeline = await getPipelineByProductIdAndBusinessId(
		product_id,
		business_id,
	);

	return pipeline;
}
