// biome-ignore lint: style useNodejsImportProtocol
import crypto from "crypto";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function classNames(...classes: Array<string | boolean>) {
	return classes.filter(Boolean).join(" ");
}

export function encryptIgAccessToken(token: string) {
	const key = process.env.IG_ACCESS_TOKEN_ENCRYPTION_KEY!;
	const iv = Buffer.from(process.env.IG_ACCESS_TOKEN_ENCRYPTION_IV!, "hex");

	const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
	let encryptedToken = cipher.update(token, "utf8", "hex");
	encryptedToken += cipher.final("hex");
	return encryptedToken;
}

export function decryptIgAccessToken(encryptedToken: string) {
	const key = process.env.IG_ACCESS_TOKEN_ENCRYPTION_KEY!;
	const iv = Buffer.from(process.env.IG_ACCESS_TOKEN_ENCRYPTION_IV!, "hex");

	const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
	let decryptedToken = decipher.update(encryptedToken, "hex", "utf8");
	decryptedToken += decipher.final("utf8");
	return decryptedToken;
}

export function isAccessTokenExpiring(expiresAt: string) {
	const currentDate = new Date();
	const threeDaysBeforeExpires = new Date(expiresAt);

	threeDaysBeforeExpires.setDate(threeDaysBeforeExpires.getDate() - 3);

	// if the current date is three days before the expires date, return true
	if (currentDate.toDateString() === threeDaysBeforeExpires.toDateString()) {
		return true;
	}

	return false;
}
