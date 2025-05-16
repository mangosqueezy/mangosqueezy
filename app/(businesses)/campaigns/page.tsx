import { getSubscriptionData } from "@/app/actions";
import { Toaster } from "@/components/ui/sonner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn, getPlanFromPriceId } from "@/lib/utils";
import Link from "next/link";
import { getUser } from "../actions";
import CampaignForm from "./campaign-form";
import { DeletePipelineButton } from "./delete-pipeline-button";

export default async function CampaignsPage() {
	const user = await getUser();
	const pipelines = user?.pipelines;
	const products = user?.products;

	const pipelineCount = pipelines?.length ?? 0;
	const subscription = await getSubscriptionData(
		user?.stripe_subscription_id as string,
	);
	const plan = getPlanFromPriceId(subscription.price_id);

	return (
		<div className="flex flex-col min-h-screen">
			<Toaster position="top-right" />

			<div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8 mt-2">
				<CampaignForm
					products={(products ?? []).map((p) => ({
						id: String(p.id),
						name: p.name,
					}))}
					business_id={user?.id}
					type="social_media"
					pipelineCount={pipelineCount}
					plan={plan}
				/>
				<CampaignForm
					products={(products ?? []).map((p) => ({
						id: String(p.id),
						name: p.name,
					}))}
					business_id={user?.id}
					stripeConnectedAccountId={user?.stripe_connected_account}
					type="stripe"
					pipelineCount={pipelineCount}
					plan={plan}
				/>
			</div>

			<h1 className="text-2xl font-bold mb-4">Campaigns</h1>

			{!pipelines || pipelines.length === 0 ? (
				<div className="text-center text-gray-500">No data available</div>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>Product Name</TableHead>
							<TableHead>Product Description</TableHead>
							<TableHead>Workflow</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{pipelines.map((pipeline) => {
							const product = products?.find(
								(p) => p.id === pipeline.product_id,
							);

							return (
								<TableRow key={`pipeline-${pipeline.id}`}>
									<TableCell>{pipeline.id}</TableCell>
									<TableCell className="font-medium">
										{product?.name || "N/A"}
									</TableCell>
									<TableCell className="truncate max-w-[200px]">
										{product?.description}
									</TableCell>
									<TableCell>
										<span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset">
											{pipeline.workflow || "social media"}
										</span>
									</TableCell>
									<TableCell>
										<span
											className={cn(
												"inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
												pipeline.status === "Pending"
													? "bg-orange-50 text-orange-700 ring-orange-600/20"
													: pipeline.status === "Completed"
														? "bg-green-50 text-green-700 ring-green-600/20"
														: "bg-gray-50 text-gray-700 ring-gray-600/20",
											)}
										>
											{pipeline.status}
										</span>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Link
												href={`/campaigns/${pipeline.id}`}
												className="text-blue-600 hover:underline"
											>
												View
											</Link>
											<DeletePipelineButton pipelineId={pipeline.id} />
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
