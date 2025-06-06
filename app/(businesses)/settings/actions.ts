"use server";

// biome-ignore lint: style useNodejsImportProtocol
import crypto from "crypto";
import prisma from "@/lib/prisma";

const SQUZY_API_KEY = process.env.SQUZY_API_KEY;

export async function getUserHash(userId: string) {
	const secretKey = process.env.INTERCOM_CRYPTO_SECRET_KEY!;
	const userIdentifier = userId;

	const hash = crypto
		.createHmac("sha256", secretKey)
		.update(userIdentifier)
		.digest("hex");

	return hash;
}

export async function createShortLink(userId: string, destinationUrl: string) {
	const options = {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${SQUZY_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			url: destinationUrl,
			folderId: "fold_1JX1EBBTTQ2ANWX42Z07Z1XQP",
		}),
	};
	const response = await fetch("https://api.squzy.link/links/upsert", options);
	const squzyResponse = await response.json();

	const shortLink = squzyResponse.shortLink;

	await prisma.business.update({
		where: { id: userId },
		data: {
			connectify_short_link: shortLink,
		},
	});

	return shortLink;
}
