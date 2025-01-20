import { getPipelineById } from "@/models/pipeline";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = new Redis({
	url: UPSTASH_REDIS_REST_URL!,
	token: UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: Request) {
	const body = await request.json();
	const { pipeline_id } = body;
	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL as string,
		process.env.SUPABASE_KEY as string,
	);

	const pipelineData = await getPipelineById(pipeline_id);

	const affiliatesResponse = await fetch(
		`https://www.mangosqueezy.com/api/bluesky/getSearchAffiliates?query=${pipelineData?.products?.description}`,
	);

	const affiliates = await affiliatesResponse.json();

	for (const affiliate of affiliates) {
		//send message to bluesky user
	}

	await redis.set(pipeline_id, pipelineData?.affiliate_count);

	await supabase
		.from("Pipelines")
		.update({
			remark: "notified affiliates",
		})
		.eq("id", pipeline_id)
		.select();

	return new Response("Success!");
}
