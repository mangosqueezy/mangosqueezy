import crypto from "node:crypto";
import { Client } from "@upstash/qstash";

const client = new Client({
	token: process.env.QSTASH_TOKEN as string,
});

export async function POST(request: Request) {
	const heygenWebhookSecret = process.env.HEYGEN_WEBHOOK_SECRET;

	const contentStr = request.body ? await request.text() : "";

	const signature = request.headers.get("signature");

	const hmac = crypto.createHmac("sha256", heygenWebhookSecret as string);
	hmac.update(contentStr);
	const computedSignature = hmac.digest("hex");

	if (computedSignature !== signature) {
		throw new Error("Invalid request");
	}

	const { event_type: eventType, event_data: eventData } =
		JSON.parse(contentStr);

	if (eventType === "avatar_video.success") {
		await client.schedules.create({
			destination: "https://www.mangosqueezy.com/api/qstash/schedules",
			cron: "*/10 * * * *",
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				videoId: eventData.video_id,
			}),
			callback: "https://www.mangosqueezy.com/api/callback/qstash/heygen",
		});
	}

	return new Response("Success!", { status: 200 });
}
