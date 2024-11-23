import { decryptIgAccessToken } from "@/lib/utils";
import { isAccessTokenExpiring } from "@/lib/utils";
import { getIgAccessToken } from "@/models/ig_refresh_token";
import { getAvailableIgScopeIdentifier } from "@/models/ig_scope_id";
import { getPipelineById } from "@/models/pipeline";
import { createClient } from "@supabase/supabase-js";
import { Client } from "@upstash/qstash";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

const IG_BUSINESS_ID = process.env.IG_BUSINESS_ID;

export const POST = verifySignatureAppRouter(async (req: Request) => {
	const requestBody = await req.json();
	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL as string,
		process.env.SUPABASE_KEY as string,
	);

	// responses from qstash are base64-encoded
	const decoded = atob(requestBody?.body);
	const parsedDecodedBody = JSON.parse(decoded);
	const { mediaContainerId, pipelineId } = parsedDecodedBody;
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

		const pipelineData = await getPipelineById(pipelineId);
		const availableIgScopeIdentifier = await getAvailableIgScopeIdentifier(
			pipelineData?.affiliate_count ?? 3,
		);

		const igUsername = availableIgScopeIdentifier
			.map((identifier) => `@${identifier.ig_username}`)
			.join(",");

		const encodedCommentText = encodeURIComponent(
			`Hi ${igUsername}, We would love to invite you to check out our affiliate program—earn commissions by promoting amazing products! DM us for details. 💼✨`,
		);

		await fetch(
			`https://graph.instagram.com/v21.0/${igPostId}/comments?message=${encodedCommentText}&access_token=${INSTAGRAM_ACCESS_TOKEN}&media_id=${igPostId}`,
			{
				method: "POST",
			},
		);

		await supabase
			.from("Pipelines")
			.update({
				ig_post_id: igPostId,
				remark: "notified affiliates",
			})
			.eq("id", pipelineId)
			.select();

		const client = new Client({
			token: process.env.QSTASH_TOKEN as string,
		});
		const schedules = client.schedules;
		await schedules.delete(scheduleId);
	}

	return new Response("Success!");
});
