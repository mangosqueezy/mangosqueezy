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
	const iv = globalThis.crypto.getRandomValues(new Uint8Array(16));
	const ivHexString = Array.from(iv)
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
	const encryptedHexString = await encryptIgAccessToken(
		accessToken,
		ivHexString,
	);

	const expiresIn = result.expires_in;

	await updateIgRefreshToken(encryptedHexString, ivHexString, expiresIn);

	return NextResponse.json({ encryptedHexString, ivHexString, expiresIn });
}
