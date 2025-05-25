import { tiers } from "@/app/pricing/page";
import type { Tables } from "@/typings/types_db";
import * as chrono from "chrono-node";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { PRICE_IDS } from "./stripe/config";

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

type Price = Tables<"prices">;

export const postData = async ({
	url,
	data,
}: {
	url: string;
	data?: { price: Price };
}) => {
	const res = await fetch(url, {
		method: "POST",
		headers: new Headers({ "Content-Type": "application/json" }),
		credentials: "same-origin",
		body: JSON.stringify(data),
	});

	return res.json();
};

export const toDateTime = (secs: number) => {
	const t = new Date(+0); // Unix epoch start.
	t.setSeconds(secs);
	return t;
};

export const calculateTrialEndUnixTimestamp = (
	trialPeriodDays: number | null | undefined,
) => {
	// Check if trialPeriodDays is null, undefined, or less than 2 days
	if (
		trialPeriodDays === null ||
		trialPeriodDays === undefined ||
		trialPeriodDays < 2
	) {
		return undefined;
	}

	const currentDate = new Date(); // Current date and time
	const trialEnd = new Date(
		currentDate.getTime() + (trialPeriodDays + 1) * 24 * 60 * 60 * 1000,
	); // Add trial days
	return Math.floor(trialEnd.getTime() / 1000); // Convert to Unix timestamp in seconds
};

const toastKeyMap: { [key: string]: string[] } = {
	status: ["status", "status_description"],
	error: ["error", "error_description"],
};

const getToastRedirect = (
	path: string,
	toastType: string,
	toastName: string,
	toastDescription = "",
	disableButton = false,
	arbitraryParams = "",
): string => {
	const [nameKey, descriptionKey] = toastKeyMap[toastType];

	let redirectPath = `${path}?${nameKey}=${encodeURIComponent(toastName)}`;

	if (toastDescription) {
		redirectPath += `&${descriptionKey}=${encodeURIComponent(toastDescription)}`;
	}

	if (disableButton) {
		redirectPath += "&disable_button=true";
	}

	if (arbitraryParams) {
		redirectPath += `&${arbitraryParams}`;
	}

	return redirectPath;
};

export const getStatusRedirect = (
	path: string,
	statusName: string,
	statusDescription = "",
	disableButton = false,
	arbitraryParams = "",
) =>
	getToastRedirect(
		path,
		"status",
		statusName,
		statusDescription,
		disableButton,
		arbitraryParams,
	);

export const getErrorRedirect = (
	path: string,
	errorName: string,
	errorDescription = "",
	disableButton = false,
	arbitraryParams = "",
) =>
	getToastRedirect(
		path,
		"error",
		errorName,
		errorDescription,
		disableButton,
		arbitraryParams,
	);

export const getPlanFromPriceId = (priceId: string): keyof typeof PRICE_IDS => {
	const plan = Object.entries(PRICE_IDS).find(
		([_, id]) => id === priceId,
	)?.[0] as keyof typeof PRICE_IDS;
	return plan;
};

export function hasFeatureAccess(
	plan: string,
	section: string,
	featureName: string,
): boolean | string | number {
	const tier = tiers.find((t) => t.slug === plan);
	if (!tier) return false;
	const feature = tier.features.find(
		(f) => f.section === section && f.name === featureName,
	);
	if (!feature) return false;

	return feature.value;
}

export const truncate = (
	str: string | null | undefined,
	length: number,
): string | null => {
	if (!str || str.length <= length) return str ?? null;
	return `${str.slice(0, length - 3)}...`;
};

export const formatDate = (
	datetime: Date | string,
	options?: Intl.DateTimeFormatOptions,
) => {
	if (datetime.toString() === "Invalid Date") return "";
	return new Date(datetime).toLocaleDateString("en-US", {
		day: "numeric",
		month: "long",
		year: "numeric",
		...options,
	});
};

export const getPrettyUrl = (url?: string | null) => {
	if (!url) return "";
	// remove protocol (http/https) and www.
	// also remove trailing slash
	return url
		.replace(/(^\w+:|^)\/\//, "")
		.replace("www.", "")
		.replace(/\/$/, "");
};

// Function to parse a date string into a Date object
export const parseDateTime = (str: Date | string) => {
	if (str instanceof Date) return str;
	return chrono.parseDate(str);
};

export const linkMappingSchema = z.object({
	campaign_name: z.string(),
	product_name: z.string(),
	product_description: z.string(),
	product_price: z.string(),
	product_price_type: z.string().optional(),
	affiliate_count: z.number().optional(),
	location: z.string().optional(),
	lead: z.string().optional(),
	click: z.string().optional(),
	sale: z.string().optional(),
});

export const pluralize = (
	word: string,
	count: number,
	options: {
		plural?: string;
	} = {},
) => {
	if (count === 1) {
		return word;
	}

	// Use custom plural form if provided, otherwise add 's'
	return options.plural || `${word}s`;
};
