"use server";

import { EmailTemplate } from "@/components/mango-ui/email-template";
import { isHeygenVideoGenerationEnabled } from "@/config/flags";
import {
	createPipeline,
	getPipelineByProductIdAndBusinessId,
} from "@/models/pipeline";
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

	const isHeygenVideoGenerationEnabledFlag =
		(await isHeygenVideoGenerationEnabled()) as boolean;
	if (isHeygenVideoGenerationEnabledFlag) {
		await qstashClient.publishJSON({
			url: "https://www.mangosqueezy.com/api/qstash/background/heygen",
			body: {
				business_id,
				product_id,
				pipeline_id: pipeline?.id,
			},
		});
	} else {
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
	}

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
