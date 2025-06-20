import { getSubscriptionData } from "@/app/actions";
import { getPlanFromPriceId } from "@/lib/utils";
import { getChatMessages } from "@/models/chat_message";
import type { ChatMessage } from "@prisma/client";
import { Redis } from "@upstash/redis";
import { getUser } from "../../actions";
import Campaign, { type Platform, type Affiliate } from "./campaign";

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
	const affiliate = potentialAffiliates[0]?.affiliates || [];
	const difficulty = potentialAffiliates[0]?.difficulty || "difficulty";
	const platform = potentialAffiliates[0]?.platform;

	const subscription = await getSubscriptionData(
		user?.stripe_subscription_id as string,
	);
	const plan = getPlanFromPriceId(subscription.price_id);

	return (
		<div className="container mx-auto px-4 py-8">
			<Campaign
				product={product}
				commission={user?.commission || 0}
				affiliates={affiliate as unknown as Affiliate[]}
				chatMessages={chatMessages as ChatMessage[]}
				pipeline_id={pipeline?.id as number}
				affiliate_count={pipeline?.affiliate_count || 0}
				location={pipeline?.location || ""}
				locationRadius={pipeline?.location_radius || "100km"}
				difficulty={difficulty}
				platform={platform as Platform}
				plan={plan}
				email={user?.email as string}
			/>
		</div>
	);
}
