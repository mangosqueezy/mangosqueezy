import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { getUserById } from "@/models/business";
import type { Affiliate_Business } from "@prisma/client";
import Link from "next/link";

export default async function MetricsPage() {
	const supabase = await createClient();
	const { data } = await supabase.auth.getUser();
	const userId = data?.user?.id as string;
	const user = await getUserById(userId);

	return (
		<div className="flex min-h-screen w-full flex-col">
			<Card>
				<CardHeader>
					<CardTitle>Metrics</CardTitle>
				</CardHeader>
				<CardContent>
					{user?.affiliate_business.length === 0 ? (
						<div className="text-center text-gray-500">No data available</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Product Name</TableHead>
									<TableHead>Link</TableHead>
									<TableHead>
										<span className="sr-only">Actions</span>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{user?.affiliate_business.map(
									(affiliate: Affiliate_Business) => {
										const productId = affiliate.product_id;
										const productName = user?.products.find(
											(p) => p.id === productId,
										)?.name;

										return (
											affiliate.affiliate_link && (
												<TableRow
													key={`table-row-${affiliate.affiliate_link_key}`}
												>
													<TableCell className="font-medium">
														{productName}
													</TableCell>
													<TableCell className="font-medium">
														{affiliate.affiliate_link}
													</TableCell>
													<TableCell className="flex justify-end">
														<Button asChild>
															<Link
																href={`/metrics/${affiliate.affiliate_link_key}`}
															>
																View
															</Link>
														</Button>
													</TableCell>
												</TableRow>
											)
										);
									},
								)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
