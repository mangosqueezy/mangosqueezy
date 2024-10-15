import { encryptIgAccessToken } from "@/lib/utils";
import { updateIgRefreshToken } from "@/models/ig_refresh_token";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const body = await request.json();
	const { access_token } = body;

	const response = await fetch(
		`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${access_token}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	const result = await response.json();

	const accessToken = result.access_token;
	const encryptedAccessToken = encryptIgAccessToken(accessToken);

	const expiresIn = result.expires_in;

	await updateIgRefreshToken(encryptedAccessToken, expiresIn);

	return NextResponse.json({ encryptedAccessToken, expiresIn });
}
