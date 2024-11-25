import { decryptIgAccessToken, isAccessTokenExpiring } from "@/lib/utils";
import { getIgAccessToken } from "@/models/ig_refresh_token";
import {
	getAvailableIgScopeIdentifier,
	getCompletedPipelineAffiliates,
} from "@/models/ig_scope_id";
import { getLatestPipeline, getPipelineById } from "@/models/pipeline";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { Client } from "@upstash/qstash";
import { generateText } from "ai";

const IG_BUSINESS_ID = process.env.IG_BUSINESS_ID;

const client = new Client({
	token: process.env.QSTASH_TOKEN as string,
});

const IMAGE_URL = [
	`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/mangosqueezy/partnership/affiliate-partnership-msg-1.png`,
	`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/mangosqueezy/partnership/affiliate-partnership-msg-2.png`,
	`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/mangosqueezy/partnership/affiliate-partnership-msg-3.png`,
	`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/mangosqueezy/partnership/affiliate-partnership-msg-4.png`,
	`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/mangosqueezy/partnership/affiliate-partnership-msg-5.png`,
];

export async function POST(request: Request) {
	const body = await request.json();
	const { pipeline_id } = body;
	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL as string,
		process.env.SUPABASE_KEY as string,
	);

	let INSTAGRAM_ACCESS_TOKEN = "";

	const igAccessToken = await getIgAccessToken();
	const isAccessTokenExpiringFlag = isAccessTokenExpiring(
		igAccessToken?.expires_at as string,
	);

	if (isAccessTokenExpiringFlag) {
		const refreshTokenResponse = await fetch(
			"https://www.mangosqueezy.com/api/instagram/refresh_token",
			{
				method: "POST",
				body: JSON.stringify({ access_token: igAccessToken?.token }),
			},
		);
		const refreshTokenResult = await refreshTokenResponse.json();
		const decryptedAccessToken = await decryptIgAccessToken(
			refreshTokenResult?.encryptedHexString,
			refreshTokenResult?.ivHexString,
		);
		INSTAGRAM_ACCESS_TOKEN = decryptedAccessToken;
	} else {
		const decryptedAccessToken = await decryptIgAccessToken(
			igAccessToken?.token as string,
			igAccessToken?.encryption_iv as string,
		);
		INSTAGRAM_ACCESS_TOKEN = decryptedAccessToken;
	}

	const pipelines = await getLatestPipeline();

	if (pipelines) {
		const pipelineData = await getPipelineById(pipeline_id);
		const availableIgScopeIdentifier = await getAvailableIgScopeIdentifier(
			pipelineData?.affiliate_count ?? 3,
		);

		const completedPipelineAffiliates = await getCompletedPipelineAffiliates(
			pipelineData?.affiliate_count ?? 3,
		);

		const listOfIgScopeIdentifier =
			availableIgScopeIdentifier.length > 0
				? availableIgScopeIdentifier
				: completedPipelineAffiliates;

		const igUsername = listOfIgScopeIdentifier
			.map((identifier) => `@${identifier.ig_username}`)
			.join(",");

		const encodedCommentText = encodeURIComponent(
			`Hi ${igUsername}, We would love to invite you to check out our affiliate program—earn commissions by promoting amazing products! DM us for details. 💼✨`,
		);

		await fetch(
			`https://graph.instagram.com/v21.0/${pipelines.ig_post_id}/comments?message=${encodedCommentText}&access_token=${INSTAGRAM_ACCESS_TOKEN}`,
			{
				method: "POST",
			},
		);

		await supabase
			.from("Pipelines")
			.update({
				ig_post_id: pipelines?.ig_post_id,
				ig_post_url: pipelines?.ig_post_url,
				remark: "notified affiliates",
			})
			.eq("id", pipeline_id)
			.select();
	} else {
		const pipeline = await getPipelineById(pipeline_id);
		const productPrice =
			(pipeline?.products?.price as number) *
			((pipeline?.business?.commission as number) / 100);
		const prompt = `
		${pipeline?.prompt}
	
		product description: mangosqueezy is an affiliate program where you can earn commission by promoting products. Earn a ${productPrice} USD commission by partnering with us. 
		includes:
		- Get paid to share a product you love and No experience needed
		- Share with friends, make ${productPrice} USD per sale!
		DM us to learn more.
		
		location: ${pipeline?.location}

		Note: Use line breaks for clarity. Maintain a visually appealing structure and all hashtags must be in lowercase.
		`;

		const { text } = await generateText({
			model: openai("o1-mini"),
			prompt: prompt,
		});

		const encodedText = encodeURIComponent(
			`Product ID: ${pipeline?.products?.id} ${text}`,
		);

		const igImageUrl = IMAGE_URL[Math.floor(Math.random() * IMAGE_URL.length)];

		const mediaContainerResponse = await fetch(
			`https://graph.instagram.com/v21.0/${IG_BUSINESS_ID}/media?image_url=${igImageUrl}&access_token=${INSTAGRAM_ACCESS_TOKEN}&caption=${encodedText}`,
			{
				method: "POST",
			},
		);
		const mediaContainerResult = await mediaContainerResponse.json();
		const mediaContainerId = mediaContainerResult?.id;

		if (pipeline) {
			await supabase
				.from("Pipelines")
				.update({
					ig_post_url: igImageUrl,
					remark: "mangosqueezy is working on this",
				})
				.eq("id", pipeline.id)
				.select();
		}

		await client.schedules.create({
			destination: "https://www.mangosqueezy.com/api/qstash/schedules",
			cron: "*/5 * * * *",
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				mediaContainerId,
				pipelineId: pipeline_id,
			}),
			callback: "https://www.mangosqueezy.com/api/callback/qstash/ig",
		});
	}

	return new Response("Success!");
}
