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

export function convertHexToBuffer(hexString: string) {
	const byteArray = new Uint8Array(hexString.length / 2);

	for (let i = 0; i < hexString.length; i += 2) {
		byteArray[i / 2] = Number.parseInt(hexString.slice(i, i + 2), 16);
	}

	return byteArray.buffer;
}

export async function encryptIgAccessToken(token: string, ivHexString: string) {
	const importedKey = await globalThis.crypto.subtle.importKey(
		"jwk",
		JSON.parse(process.env.IG_ACCESS_TOKEN_ENCRYPTION_KEY!),
		{
			name: "AES-CBC",
			length: 256,
		},
		true,
		["encrypt", "decrypt"],
	);

	// The iv must never be reused with a given key.
	const encryptedAccessToken = await globalThis.crypto.subtle.encrypt(
		{
			name: "AES-CBC",
			iv: convertHexToBuffer(ivHexString),
		},
		importedKey,
		new TextEncoder().encode(token),
	);

	const encryptedArrayBuffer = new Uint8Array(encryptedAccessToken);
	const encryptedHexString = Array.from(encryptedArrayBuffer)
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");

	return encryptedHexString;
}

export async function decryptIgAccessToken(
	encryptedHexString: string,
	ivHexString: string,
) {
	const importedKey = await globalThis.crypto.subtle.importKey(
		"jwk",
		JSON.parse(process.env.IG_ACCESS_TOKEN_ENCRYPTION_KEY!),
		{
			name: "AES-CBC",
			length: 256,
		},
		true,
		["encrypt", "decrypt"],
	);
	const decrypted = await globalThis.crypto.subtle.decrypt(
		{
			name: "AES-CBC",
			iv: convertHexToBuffer(ivHexString),
		},
		importedKey,
		convertHexToBuffer(encryptedHexString),
	);

	const decoder = new TextDecoder();
	const decryptedToken = decoder.decode(decrypted);

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
