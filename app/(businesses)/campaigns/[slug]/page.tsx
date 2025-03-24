import { getChatMessages } from "@/models/chat_message";
import type { ChatMessage } from "@prisma/client";
import { Redis } from "@upstash/redis";
import { getUser } from "../../actions";
import Campaign, { type Affiliate } from "./campaign";

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = new Redis({
	url: UPSTASH_REDIS_REST_URL!,
	token: UPSTASH_REDIS_REST_TOKEN!,
});

export type potentialAffiliates = {
	platform: string;
	difficulty: string;
	affiliates: Affiliate[];
};

export default async function CampaignsPage(props: {
	params: Promise<{ slug: string }>;
}) {
	const params = await props.params;
	const { slug } = params;

	const user = await getUser();
	const pipelines = user?.pipelines;
	const products = user?.products;

	const pipeline = pipelines?.find((p) => p.id === Number.parseInt(slug));
	const product = products?.find((p) => p.id === pipeline?.product_id);

	const chatMessages = await getChatMessages({
		pipeline_id: pipeline?.id as number,
	});

	const potentialAffiliates = (await redis.smembers(
		slug,
	)) as potentialAffiliates[];
	const affiliate = potentialAffiliates[0].affiliates;
	const difficulty = potentialAffiliates[0].difficulty;
	const platform = potentialAffiliates[0].platform;

	return (
		<div className="container mx-auto px-4 py-8">
			<Campaign
				product={product}
				commission={user?.commission || 0}
				affiliates={affiliate as unknown as Affiliate[]}
				chatMessages={chatMessages as ChatMessage[]}
				pipeline_id={pipeline?.id as number}
				affiliate_count={pipeline?.affiliate_count || 0}
				difficulty={difficulty}
				platform={platform}
			/>
		</div>
	);
}
