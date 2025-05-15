import { getSubscriptionData } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { getPlanFromPriceId } from "@/lib/utils";
import { getUserById } from "@/models/business";
import Product, { type TBusiness } from "./components/product";

export const revalidate = 0;

export default async function ProductsPage() {
	const supabase = await createClient();
	const { data } = await supabase.auth.getUser();
	const userId = data?.user?.id as string;
	const user: TBusiness | undefined | null = await getUserById(userId);

	const productCount = user?.products?.length ?? 0;
	const subscription = await getSubscriptionData(
		user?.stripe_subscription_id as string,
	);
	const plan = getPlanFromPriceId(subscription.price_id);

	return <Product user={user} productCount={productCount} plan={plan} />;
}
