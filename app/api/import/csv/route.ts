import { linkMappingSchema } from "@/lib/utils";
import { Client } from "@upstash/qstash";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import Papa from "papaparse";

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const qstash = new Client({
	token: process.env.QSTASH_TOKEN || "",
});
const redis = new Redis({
	url: UPSTASH_REDIS_REST_URL!,
	token: UPSTASH_REDIS_REST_TOKEN!,
});

// POST /api/workspaces/[idOrSlug]/import/csv - create job to import links from CSV file
export async function POST(req: Request) {
	const formData = await req.formData();

	const file = formData.get("file") as File;
	const userId = formData.get("userId") as string;

	if (!file) {
		return NextResponse.json({ error: "No file provided" }, { status: 400 });
	}

	const mapping = linkMappingSchema.parse(
		Object.fromEntries(
			Array.from(formData.entries()).filter(
				([key]) => key !== "file" && key !== "folderId",
			),
		) as Record<string, string>,
	);

	const id = crypto.randomUUID();
	const redisKey = `import:csv:${userId}:${id}`;
	const BATCH_SIZE = 1000; // Push 1000 rows to Redis at a time
	let rows: Record<string, string>[] = [];

	// Convert file to text
	const csvText = await file.text();

	// Parse CSV and add rows to Redis
	await new Promise<void>((resolve, reject) => {
		Papa.parse(csvText, {
			header: true,
			skipEmptyLines: true,
			step: async (results) => {
				rows.push(results.data as Record<string, string>);

				if (rows.length >= BATCH_SIZE) {
					try {
						await redis.lpush(`${redisKey}:rows`, ...rows);
						rows = [];
					} catch (error) {
						reject(error);
					}
				}
			},
			complete: () => resolve(),
			error: reject,
		});
	});

	// Add any remaining rows to Redis
	if (rows.length > 0) {
		await redis.lpush(`${redisKey}:rows`, ...rows);
	}

	// Initialize Redis counters
	await Promise.all([
		redis.set(`${redisKey}:created`, "0"),
		redis.set(`${redisKey}:processed`, "0"),
	]);

	await qstash.publishJSON({
		url: "https://www.mangosqueezy.com/api/qstash/background/import/csv",
		body: {
			userId,
			id,
			mapping,
		},
	});

	return NextResponse.json({});
}
