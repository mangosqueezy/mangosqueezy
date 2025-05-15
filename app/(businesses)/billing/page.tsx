import { getSubscriptionData } from "@/app/actions";
import { Toaster } from "@/components/ui/sonner";
import { getPlanFromPriceId } from "@/lib/utils";
import { getUser } from "../actions";
import Plan from "./plan";

export default async function Billing() {
	const user = await getUser();
	const stripeCustomerId = user?.stripe_customer_id as string;
	const subscription = await getSubscriptionData(
		user?.stripe_subscription_id as string,
	);
	const plan = getPlanFromPriceId(subscription.price_id);
	const subscriptionItemId = subscription.subscription_item_id;

	return (
		<>
			<Toaster position="top-right" />
			<Plan
				plan={plan}
				stripeCustomerId={stripeCustomerId}
				stripeSubscriptionId={user?.stripe_subscription_id as string}
				subscriptionItemId={subscriptionItemId}
			/>
		</>
	);
}
