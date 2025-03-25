"use server";

import { EmailTemplate } from "@/components/mango-ui/email-template";
import { createChatMessage } from "@/models/chat_message";
import { getProductById } from "@/models/products";
import { Client } from "@upstash/qstash";
import { Redis } from "@upstash/redis";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import type { Affiliate } from "./campaign";

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = new Redis({
	url: UPSTASH_REDIS_REST_URL!,
	token: UPSTASH_REDIS_REST_TOKEN!,
});

const client = new Client({
	token: process.env.QSTASH_TOKEN as string,
});

export async function createChatMessageAction(
	pipeline_id: number,
	message: string,
	receiver: string,
) {
	const chatMessage = await createChatMessage({
		pipeline_id,
		text: message,
		sender: "amit@tapasom.com",
		receiver: receiver,
	});

	// temporary email notification
	const resend = new Resend(process.env.RESEND_API_KEY);
	await resend.emails.send({
		from: "mangosqueezy <amit@tapasom.com>",
		to: ["amit@tapasom.com"],
		subject: `New message to ${receiver} for pipeline ${pipeline_id}`,
		react: EmailTemplate({
			firstName: "there",
			text: message,
		}) as React.ReactElement,
	});

	return chatMessage;
}

export async function deleteAffiliateAction(
	pipeline_id: string,
	difficulty: string,
	affiliates: Affiliate[],
	platform: string,
) {
	await redis.spop(pipeline_id);
	await redis.sadd(pipeline_id, {
		platform,
		difficulty,
		affiliates: [...affiliates],
	});

	revalidatePath(`/campaigns/${pipeline_id}`);

	return true;
}

export async function getAffiliatesAction({
	product_id,
	pipeline_id,
	affiliate_count,
	difficulty,
	platform,
}: {
	product_id: string;
	pipeline_id: string;
	affiliate_count: string;
	difficulty: string;
	platform: string;
}) {
	if (platform === "bluesky") {
		await fetch(
			`https://www.mangosqueezy.com/api/bluesky/getSearchAffiliates?product_id=${product_id}&limit=100&pipeline_id=${pipeline_id}&affiliate_count=${affiliate_count}&difficulty=${difficulty}&platform=${platform}`,
			{
				method: "GET",
			},
		);
	} else if (platform === "instagram") {
		const product = await getProductById(Number(product_id));

		await client.publishJSON({
			url: "https://mangosqueezy-hono-app-76817065059.us-central1.run.app/api/search-ig-user",
			body: {
				description: product?.description,
				affiliate_count,
				pipeline_id,
				difficulty,
				operation: "single",
			},
		});
	}

	revalidatePath(`/campaigns/${pipeline_id}`);

	return true;
}
