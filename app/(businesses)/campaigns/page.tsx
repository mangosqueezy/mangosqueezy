import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getUser } from "../actions";

export default async function CampaignsPage() {
	const user = await getUser();
	const pipelines = user?.pipelines;
	const products = user?.products;

	return (
		<div className="flex min-h-screen w-full flex-col">
			<Card>
				<CardHeader>
					<CardTitle>Campaigns</CardTitle>
				</CardHeader>
				<CardContent>
					{!pipelines || pipelines.length === 0 ? (
						<div className="text-center text-gray-500">No data available</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Job ID</TableHead>
									<TableHead>Product Name</TableHead>
									<TableHead>Product Description</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>View</TableHead>
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
											<TableCell>{product?.description}</TableCell>
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
												<Link
													href={`/campaigns/${pipeline.id}`}
													className="text-blue-600 hover:underline"
												>
													View
												</Link>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
