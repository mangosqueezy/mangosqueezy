import { getUserById } from "@/models/business";
import { ConnectifyForm } from "./components/ConnectifyForm";

const StatusDisplay = ({ message }: { message: string }) => (
	<div className="flex flex-col items-center justify-center h-screen bg-gray-50">
		<div className="p-8 rounded-lg border border-orange-200 bg-orange-50">
			<h1 className="text-2xl font-bold text-gray-700">{message}</h1>
		</div>
	</div>
);

export default async function Page(props: {
	params: Promise<{ slug: Array<string> }>;
}) {
	const params = await props.params;
	const businessId = params.slug[0];
	const user = await getUserById(businessId);

	if (!user?.id) {
		return <StatusDisplay message="There is no business with this id" />;
	}

	const commission_percentage = user.commission || 0;
	const products = user.products || [];

	if (products.length === 0) {
		return <StatusDisplay message="The admin has not added any products yet" />;
	}

	return (
		<ConnectifyForm
			products={products}
			businessId={businessId}
			commission_percentage={commission_percentage}
		/>
	);
}
