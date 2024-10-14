import crypto from "node:crypto";
import { Client } from "@upstash/qstash";

const client = new Client({
	token: process.env.QSTASH_TOKEN as string,
});

export async function POST(request: Request) {
	const heygenWebhookSecret = process.env.HEYGEN_WEBHOOK_SECRET;

	const contentStr = request.body ? await request.text() : "";

	// Extracting the signature from the request headers
	const signature = request.headers.get("signature");

	// Calculating the HMAC of the content with the secret key
	const hmac = crypto.createHmac("sha256", heygenWebhookSecret as string);
	hmac.update(contentStr);
	const computedSignature = hmac.digest("hex");

	// Checking if the computed signature matches the received signature
	if (computedSignature !== signature) {
		throw new Error("Invalid request");
	}

	// Processing the event data from the request JSON
	const { event_type: eventType, event_data: eventData } =
		JSON.parse(contentStr);

	if (eventType === "avatar_video.success") {
		console.log(
			`Video Generation Completed: ${JSON.stringify({
				videoId: eventData.video_id,
				videoUrl: eventData.video_url,
				callbackId: eventData.callback_id,
			})}`,
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
		// 	callback: "https://www.mangosqueezy.com/api/callback/qstash/heygen",
		// });
	}

	console.log(
		"Heygen Webhook Received",
		JSON.stringify({
			videoId: eventData.video_id,
			videoUrl: eventData.video_url,
			callbackId: eventData.callback_id,
		}),
	);

	return new Response("Success!", { status: 200 });
}
