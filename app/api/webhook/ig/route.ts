import { isIgAssistEnabled } from "@/config/flags";
import { decryptIgAccessToken } from "@/lib/utils";
import { isAccessTokenExpiring } from "@/lib/utils";
import { getIgAccessToken } from "@/models/ig_refresh_token";
import { createIgScopeIdentifier } from "@/models/ig_scope_id";

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

	console.log("jsonBody POST => ", {
		jsonBody,
		changes: JSON.stringify(changes),
		entry: JSON.stringify(jsonBody.entry),
	});

	const igAssistEnabled = (await isIgAssistEnabled()) as boolean;

	if (messaging && messaging?.length > 0) {
		for (const message of messaging) {
			console.log("/api/webhook/ig/ POST => ", { message, appUsersIgUserId });

			if (message.recipient.id !== IG_BUSINESS_ID) {
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

				const recipientId = message.recipient.id;

				const response = await fetch(
					`https://graph.instagram.com/v21.0/${recipientId}?fields=name,username,profile_pic,follower_count,is_user_follow_business,is_business_follow_user&access_token=${INSTAGRAM_ACCESS_TOKEN}`,
					{
						method: "GET",
					},
				);

				const result = await response.json();

				await createIgScopeIdentifier({
					recipient_id: recipientId,
					ig_username: result?.username,
				});
			}

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
