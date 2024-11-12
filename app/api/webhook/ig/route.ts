import { isIgAssistEnabled } from "@/config/flags";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const hubChallenge = searchParams.get("hub.challenge");
	const hubVerifyToken = searchParams.get("hub.verify_token");

	if (hubVerifyToken === process.env.INSTAGRAM_VERIFY_TOKEN) {
		return new Response(hubChallenge, {
			status: 200,
		});
	}

	return new Response("Invalid token", {
		status: 403,
	});
}

export async function POST(request: Request) {
	const IG_BUSINESS_ID = process.env.IG_BUSINESS_ID;
	const body = await request.text();

	const jsonBody = JSON.parse(body);

	const appUsersIgUserId = jsonBody?.entry[0]?.id;
	const messaging = jsonBody?.entry[0]?.messaging;
	const changes = jsonBody?.entry[0]?.changes;

	console.log("jsonBody POST => ", { jsonBody, changes });

	const igAssistEnabled = (await isIgAssistEnabled()) as boolean;

	if (messaging && messaging?.length > 0) {
		for (const message of messaging) {
			console.log("/api/webhook/ig/ POST => ", { message, appUsersIgUserId });

			if (message.sender.id !== IG_BUSINESS_ID && igAssistEnabled) {
				await fetch("https://mangosqueezy-hono-app.vercel.app/api/workflow", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						text: message.message.text,
						recipientId: message.sender.id,
					}),
				});
			}
		}
	}

	return new Response("Received", { status: 200 });
}
