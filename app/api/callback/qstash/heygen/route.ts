import { getPipelineByVideoId } from "@/models/pipeline";
import { openai } from "@ai-sdk/openai";
import { Client } from "@upstash/qstash";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { generateText } from "ai";

const IG_BUSINESS_ID = process.env.IG_BUSINESS_ID;
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

export const POST = verifySignatureAppRouter(async (req: Request) => {
	const body = await req.json();

	const parsedPayload = JSON.parse(body);
	const scheduleId = parsedPayload.scheduleId;

	// responses from qstash are base64-encoded
	const decoded = atob(parsedPayload.body);
	const parsedDecodedBody = JSON.parse(decoded);
	const { videoId, videoUrl, callbackId } = parsedDecodedBody;

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

	if (heygenResult?.data?.status === "success") {
		const pipeline = await getPipelineByVideoId(videoId);

		const { text } = await generateText({
			model: openai("gpt-4o-2024-08-06"),
			system:
				"You are a Instagram caption generator. Provide a short and engaging caption for the Instagram Reel.",
			prompt: pipeline?.prompt as string,
		});

		const encodedText = encodeURIComponent(text);

		const response = await fetch(
			`https://graph.instagram.com/v21.0/${IG_BUSINESS_ID}/media?media_type=REELS&video_url=http&access_token=${INSTAGRAM_ACCESS_TOKEN}&share_to_feed=true&caption=${encodedText}`,
			{
				method: "POST",
			},
		);

		// await client.schedules.create({
		// 	destination: "https://www.mangosqueezy.com/api/qstash/schedules",
		// 	cron: "*/5 * * * *",
		// 	method: "POST",
		// 	headers: {
		// 		"content-type": "application/json",
		// 	},
		// 	body: JSON.stringify({
		// 		videoId: eventData.video_id,
		// 		videoUrl: eventData.video_url,
		// 		callbackId: eventData.callback_id,
		// 	}),
		// 	callback: "https://www.mangosqueezy.com/api/callback/qstash/ig",
		// });

		// 	const client = new Client({
		// 		token: process.env.QSTASH_TOKEN as string,
		// 	});
		// 	const schedules = client.schedules;
		// 	await schedules.delete(scheduleId);
	}

	// const containerStatusResponse = await fetch(
	// 	`https://graph.facebook.com/${mediaContainerId}?access_token=${profileKey}&fields=status_code`,
	// 	{
	// 		method: "GET",
	// 	},
	// );

	// const containerStatusResult = await containerStatusResponse.json();

	// if (containerStatusResult?.status_code === "FINISHED") {
	// 	const response = await fetch(
	// 		`https://graph.facebook.com/v19.0/${igBusinessId}/media_publish?access_token=${profileKey}&creation_id=${mediaContainerId}`,
	// 		{
	// 			method: "POST",
	// 		},
	// 	);

	// 	const result = await response.json();

	// 	if (userType === "creator") {
	// 		// await updatePublishPost(publishPostId, result?.id);
	// 	} else {
	// 		// await updatePublishPostWithPaymentUpdate(publishPostId, result?.id);
	// 	}

	// 	const client = new Client({
	// 		token: process.env.QSTASH_TOKEN as string,
	// 	});
	// 	const schedules = client.schedules;
	// 	await schedules.delete(scheduleId);
	// }

	return new Response(JSON.stringify(body));
});
