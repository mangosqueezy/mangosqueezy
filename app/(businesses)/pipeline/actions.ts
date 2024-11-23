"use server";

import { EmailTemplate } from "@/components/mango-ui/email-template";
import {
	createPipeline,
	getPipelineByProductIdAndBusinessId,
} from "@/models/pipeline";
import { getProductById } from "@/models/products";
import { createResource } from "@/services/createResource";
import { Client } from "@upstash/qstash";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const qstashClient = new Client({
	token: process.env.QSTASH_TOKEN as string,
});

export async function createPipelineAction(
	product_id: number,
	prompt: string,
	affiliate_count: number,
	location: string,
	business_id: string,
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

	await qstashClient.publishJSON({
		url: "https://www.mangosqueezy.com/api/qstash/background/ig",
		body: {
			business_id,
			product_id,
			pipeline_id: pipeline?.id,
		},
	});

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

	revalidatePath("/pipeline/status");

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
