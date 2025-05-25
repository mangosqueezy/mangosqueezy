import { LinksImportErrors } from "@/app/emails/link-import-errors";
import { LinksImported } from "@/app/emails/link-imported";
import { getUserById } from "@/models/business";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const normalizeString = (key: string) => {
	if (!key) return "";

	const original = key;
	const normalized = key
		// Remove BOM and other special characters
		.replace(/^\uFEFF/, "")
		.replace(/^\uFFFE/, "") // Remove Byte Order Mark
		.replace(/^\uEFBBBF/, "") // Remove Byte Order Mark
		// biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
		.replace(/^\u0000\uFEFF/, "") // Remove Byte Order Mark
		.replace(/^\uFFFE0000/, "") // Remove Byte Order Mark
		.replace(/^\u2028/, "") // Remove Line Separator
		.replace(/^\u2029/, "") // Remove Paragraph Separator
		// Remove any non-printable characters
		// biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
		.replace(/[\x00-\x1F\x7F-\x9F]/g, "")
		// Normalize whitespace
		.replace(/\s+/g, " ")
		.trim()
		// Optional: normalize case
		.toLowerCase();

	// Optional: Add logging in development
	if (process.env.NODE_ENV === "development" && original !== normalized) {
		console.info(`Normalized key: "${original}" -> "${normalized}"`);
	}

	return normalized;
};

export async function sendCsvImportEmails({
	userId,
	count,
	campaigns,
	errorLinks,
}: {
	userId: string;
	count: number;
	campaigns: string[];
	errorLinks: {
		domain: string;
		key: string;
		error: string;
	}[];
}) {
	campaigns = Array.isArray(campaigns) && campaigns.length > 0 ? campaigns : [];
	errorLinks =
		Array.isArray(errorLinks) && errorLinks.length > 0 ? errorLinks : [];

	const user = await getUserById(userId);

	const ownerEmail = user?.email ?? "";

	if (count > 0) {
		await resend.emails.send({
			from: "mangosqueezy <amit@tapasom.com>",
			to: [ownerEmail],
			subject: "Your CSV campaigns have been imported!",
			react: LinksImported({
				email: ownerEmail,
				provider: "CSV",
				count,
				campaigns,
			}),
		});
	}

	if (errorLinks.length > 0) {
		await resend.emails.send({
			from: "mangosqueezy <amit@tapasom.com>",
			to: [ownerEmail],
			subject: "Some CSV campaigns failed to import",
			react: LinksImportErrors({
				email: ownerEmail,
				provider: "CSV",
				errorLinks,
			}),
		});
	}
}
