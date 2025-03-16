import { getUserById } from "@/models/business";
import { ConnectifyForm } from "./components/ConnectifyForm";

export default async function Page(props: {
	params: Promise<{ slug: Array<string> }>;
}) {
	const params = await props.params;

	const businessId = params.slug[0];
	const user = await getUserById(businessId);

	const products = user?.products;

	return <ConnectifyForm products={products || []} businessId={businessId} />;
}
