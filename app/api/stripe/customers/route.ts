import type { RunMode } from "@/prisma/app/generated/prisma/client";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { type Difficulty, evalAi } from "./evalAi";

const stripe = new Stripe(process.env.STRIPE_SK!);

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = new Redis({
	url: UPSTASH_REDIS_REST_URL!,
	token: UPSTASH_REDIS_REST_TOKEN!,
});

export type StripeAffiliate = {
	email: string;
	evaluation: "Yes" | "No";
	reason: string;
	total_charges: number;
	status: "active" | "inactive";
	runMode: RunMode;
};

export type potentialAffiliates = {
	difficulty: string;
	affiliates: StripeAffiliate[];
};

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const pipeline_id = searchParams.get("pipeline_id") || "";
		const affiliate_count = searchParams.get("affiliate_count") || "10";
		const difficulty: string = searchParams.get("difficulty") || "easy";
		const connected_account_id = searchParams.get("connected_account_id") || "";

		const customers = await stripe.customers.list({
			stripeAccount: connected_account_id,
		});

		const affiliates: StripeAffiliate[] = [];
		for (const customer of customers.data) {
			const charges = await stripe.charges.list(
				{
					customer: customer.id,
					limit: 10,
				},
				{
					stripeAccount: connected_account_id,
				},
			);

			const evalResult = await evalAi({
				charges,
				difficulty: difficulty as Difficulty,
			});

			affiliates.push({
				email: customer.email || "",
				evaluation: evalResult.evaluation as "Yes" | "No",
				total_charges: evalResult.total_charges || 0,
				reason: evalResult.reason,
				status: "active",
				runMode: "Manual",
			});
		}

		// Filter out null results and those that don't meet criteria
		const validResults = affiliates
			.filter((result): result is NonNullable<typeof result> => result !== null)
			.filter((result) => result.evaluation === "Yes")
			.slice(0, Number.parseInt(affiliate_count));

		// Store results in Redis
		const result = await redis.sadd(pipeline_id, {
			platform: "stripe",
			difficulty,
			affiliates: validResults,
		});

		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		console.error("Error:", error);
		return NextResponse.json(
			{ error: "Something went wrong" },
			{ status: 400 },
		);
	}
}
