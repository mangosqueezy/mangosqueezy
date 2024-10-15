import prisma from "@/lib/prisma";
import { format } from "date-fns";

export async function updateIgRefreshToken(
	access_token: string,
	expires_in: number,
) {
	const igAccessTokenId = process.env.IG_ACCESS_TOKEN_ID!;
	const expiresDate = new Date(Date.now() + expires_in * 1000);
	const formattedExpiresDate = format(expiresDate, "yyyy-MM-dd");

	return prisma.ig_access_token.update({
		where: {
			id: igAccessTokenId,
		},
		data: {
			token: access_token,
			expires_at: formattedExpiresDate,
		},
	});
}

export async function getIgAccessToken() {
	const igAccessTokenId = process.env.IG_ACCESS_TOKEN_ID!;

	return prisma.ig_access_token.findUnique({
		where: {
			id: igAccessTokenId,
		},
	});
}
