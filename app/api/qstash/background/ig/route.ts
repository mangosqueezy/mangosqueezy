import { decryptIgAccessToken, isAccessTokenExpiring } from "@/lib/utils";
import { getIgAccessToken } from "@/models/ig_refresh_token";
import { getPipelineByVideoId } from "@/models/pipeline";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { Client } from "@upstash/qstash";
import { generateText } from "ai";

const IG_BUSINESS_ID = process.env.IG_BUSINESS_ID;

const client = new Client({
	token: process.env.QSTASH_TOKEN as string,
});

export async function POST(request: Request) {
	const body = await request.json();
	const { videoId } = body;
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

	const heygenResponse = await fetch(
		`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
		{
			method: "GET",
			headers: {
				"X-Api-Key": process.env.HEYGEN_API_KEY as string,
			},
		},
	);

	const heygenResult = await heygenResponse.json();

	if (heygenResult?.data?.status === "completed") {
		const pipeline = await getPipelineByVideoId(videoId);
		const prompt = `
		${pipeline?.prompt}
	
		product description: ${pipeline?.products?.description}
		
		location: ${pipeline?.location}
		`;

		const { text } = await generateText({
			model: openai("gpt-4o-2024-08-06"),
			system: `You are a Instagram caption generator. Provide a short and engaging caption for the Instagram Reel. 
			${pipeline?.format}
			Use line breaks for clarity. Maintain a visually appealing structure.`,
			prompt: prompt,
		});

		const encodedText = encodeURIComponent(
			`Product ID: ${pipeline?.products?.id} ${text}`,
		);

		const videoUrl = heygenResult?.data?.video_url;
		const videoUrlResponse = await fetch(videoUrl);
		const blob = await videoUrlResponse.blob();

		const { data } = await supabase.storage
			.from("mangosqueezy")
			.upload(`videos/mangosqueezy-video-${videoId}`, blob, {
				cacheControl: "3600",
				contentType: "video/mp4",
			});

		if (data) {
			const igVideoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/mangosqueezy/${data?.path}`;

			const mediaContainerResponse = await fetch(
				`https://graph.instagram.com/v21.0/${IG_BUSINESS_ID}/media?media_type=REELS&video_url=${igVideoUrl}&access_token=${INSTAGRAM_ACCESS_TOKEN}&share_to_feed=true&caption=${encodedText}`,
				{
					method: "POST",
				},
			);
			const mediaContainerResult = await mediaContainerResponse.json();
			const mediaContainerId = mediaContainerResult?.id;

			const pipeline = await getPipelineByVideoId(videoId);
			if (pipeline) {
				await supabase
					.from("Pipelines")
					.update({
						ig_post_url: igVideoUrl,
						remark: "video has been processed for Instagram upload",
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
					videoId,
				}),
				callback: "https://www.mangosqueezy.com/api/callback/qstash/ig",
			});
		}
	}

	return new Response("Success!");
}
