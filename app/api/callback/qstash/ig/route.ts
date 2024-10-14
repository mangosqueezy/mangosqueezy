import { getPipelineByVideoId } from "@/models/pipeline";
import { openai } from "@ai-sdk/openai";
import { Client } from "@upstash/qstash";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { generateText } from "ai";

const IG_BUSINESS_ID = process.env.IG_BUSINESS_ID;

export const POST = verifySignatureAppRouter(async (req: Request) => {
	const body = await req.json();

	const parsedPayload = JSON.parse(body);
	const scheduleId = parsedPayload.scheduleId;

	// responses from qstash are base64-encoded
	const decoded = atob(parsedPayload.body);
	const parsedDecodedBody = JSON.parse(decoded);
	const { videoId, videoUrl, callbackId } = parsedDecodedBody;

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
