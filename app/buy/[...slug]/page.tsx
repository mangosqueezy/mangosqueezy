import { isMoonpayEnabled, isRealTimePaymentsEnabled } from "@/config/flags";
import { getAffiliateById } from "@/models/affiliates";
import { getUserById } from "@/models/business";
import { getProductById } from "@/models/products";
import Checkout from "./components/checkout";

export default async function Page(props: {
	params: Promise<{ slug: Array<string> }>;
}) {
	const params = await props.params;
	const affiliateId = Number.parseInt(decodeURIComponent(params.slug[0]));
	const user = await getAffiliateById(affiliateId);
	const productId = Number.parseInt(params.slug[1] as string);
	const product = await getProductById(productId);
	const formattedAmount = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(Number(product?.price || "0"));
	const moonpayEnabled = (await isMoonpayEnabled()) as boolean;
	const realTimePaymentsEnabled =
		(await isRealTimePaymentsEnabled()) as boolean;
	const business = await getUserById(product?.business_id as string);

	return (
		<Checkout
			product={product}
			formattedAmount={formattedAmount}
			affiliateId={user?.id}
			moonpayEnabled={moonpayEnabled}
			realTimePaymentsEnabled={realTimePaymentsEnabled}
			stripeConnectedAccount={business?.stripe_connected_account ?? ""}
		/>
	);
}
