import { decryptIgAccessToken } from "@/lib/utils";
import { isAccessTokenExpiring } from "@/lib/utils";
import { getIgAccessToken } from "@/models/ig_refresh_token";
import { getPipelineByVideoId, updatePipeline } from "@/models/pipeline";
import { Client } from "@upstash/qstash";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

const IG_BUSINESS_ID = process.env.IG_BUSINESS_ID;

export const POST = verifySignatureAppRouter(async (req: Request) => {
	const requestBody = await req.json();

	// responses from qstash are base64-encoded
	const decoded = atob(requestBody?.body);
	const parsedDecodedBody = JSON.parse(decoded);
	const { mediaContainerId, videoId } = parsedDecodedBody;
	const scheduleId = requestBody?.scheduleId;

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
		const decryptedAccessToken = decryptIgAccessToken(
			refreshTokenResult?.encryptedAccessToken,
		);
		INSTAGRAM_ACCESS_TOKEN = decryptedAccessToken;
	} else {
		const decryptedAccessToken = decryptIgAccessToken(
			igAccessToken?.token as string,
		);
		INSTAGRAM_ACCESS_TOKEN = decryptedAccessToken;
	}

	const containerStatusResponse = await fetch(
		`https://graph.instagram.com/v21.0/${mediaContainerId}?access_token=${INSTAGRAM_ACCESS_TOKEN}&fields=status_code`,
		{
			method: "GET",
		},
	);

	const containerStatusResult = await containerStatusResponse.json();

	if (containerStatusResult?.status_code === "FINISHED") {
		const response = await fetch(
			`https://graph.instagram.com/v21.0/${IG_BUSINESS_ID}/media_publish?access_token=${INSTAGRAM_ACCESS_TOKEN}&creation_id=${mediaContainerId}`,
			{
				method: "POST",
			},
		);

		const result = await response.json();
		const igPostId = result?.id;

		const pipeline = await getPipelineByVideoId(videoId);
		if (pipeline) {
			await updatePipeline(pipeline.id, {
				ig_post_id: igPostId,
				remark: "video has been posted to instagram",
			});
		}

		const client = new Client({
			token: process.env.QSTASH_TOKEN as string,
		});
		const schedules = client.schedules;
		await schedules.delete(scheduleId);
	}

	return new Response("Success!");
});
