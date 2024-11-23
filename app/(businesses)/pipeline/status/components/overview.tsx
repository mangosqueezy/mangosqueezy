"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { classNames, cn } from "@/lib/utils";
import type { Pipelines, Products } from "@prisma/client";
import { ChevronLeft, CircleCheck, Dot, Loader } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const steps = [
	"mangosqueezy is working on this",
	"finding affiliates",
	"notified affiliates",
	"secured affiliates",
];

const remarks = [
	{
		id: 1,
		previousStep: null,
		content: "mangosqueezy is working on this",
		completed: "started working on this",
		upcoming: "mangosqueezy is not working on this",
		icon: CircleCheck,
		iconBackground: "bg-gray-400",
	},
	{
		id: 2,
		previousStep: "mangosqueezy is working on this",
		content: "finding affiliates",
		completed: "found affiliates",
		upcoming: "Affiliates have been found and now system is notifying them",
		icon: CircleCheck,
		iconBackground: "bg-blue-500",
	},
	{
		id: 3,
		previousStep: "finding affiliates",
		content: "notifying affiliates",
		completed: "affiliates have been notified",
		upcoming: "system will notify affiliates",
		icon: CircleCheck,
		iconBackground: "bg-blue-500",
	},
	{
		id: 4,
		previousStep: "notified affiliates",
		content: "affiliates have not been secured",
		completed: "affiliates have been secured",
		upcoming: "system will secure affiliates",
		icon: CircleCheck,
		iconBackground: "bg-green-500",
	},
];

const supabase = createClient();

export default function Overview({
	pipelines: pipelinesData,
	userId,
	products,
}: {
	pipelines: Pipelines[];
	userId: string | undefined;
	products: Products[];
}) {
	const [pipelines, setPipelines] = useState<Pipelines[]>(pipelinesData);

	useEffect(() => {
		const channel = supabase
			.channel("custom-all-channel")
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "Pipelines",
					filter: `business_id=eq.${userId}`,
				},
				(payload) => {
					setPipelines(
						pipelines.map((p) =>
							p.id === payload.new.id ? (payload.new as Pipelines) : p,
						),
					);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [userId, pipelines]);

	return (
		<div className="max-w-7xl mx-auto">
			<div className="flex justify-between items-center w-72 md:w-[600px]">
				<h1 className="text-xl font-semibold text-gray-900">Pipelines</h1>
				<Button asChild variant="ghost">
					<Link href="/pipeline">
						<ChevronLeft className="w-4 h-4" />
						Back
					</Link>
				</Button>
			</div>
			<div
				className={cn(
					pipelines?.length === 0 && "w-96",
					"hidden md:flex flex-row gap-8 items-center justify-center bg-gray-100 p-2 rounded-lg my-5",
				)}
			>
				<div className="text-md font-semibold text-gray-600 text-center w-full">
					Workflow
				</div>
				<div className="text-md font-semibold text-gray-600 text-center w-full">
					Product
				</div>
			</div>
			<ul className="divide-y divide-gray-100">
				{pipelines?.length === 0 ? (
					<div className="text-center text-gray-500">No data available</div>
				) : (
					<Accordion type="single" collapsible className="w-full">
						{pipelines?.map((pipeline: Pipelines) => {
							const product = products?.find(
								(p) => p.id === pipeline.product_id,
							);
							return (
								<AccordionItem key={pipeline.id} value={pipeline.id.toString()}>
									<AccordionTrigger>
										<div className="flex flex-row items-center justify-between w-full">
											<Badge
												variant="outline"
												className={
													pipeline.status.toLowerCase() === "pending"
														? "bg-orange-100 border-orange-300 text-semibold"
														: pipeline.status.toLowerCase() === "completed"
															? "bg-green-100 border-green-300 text-semibold"
															: ""
												}
											>
												{pipeline.status}
											</Badge>
											<span className="text-sm text-gray-500 mr-2 truncate max-w-[200px]">
												{product?.name}
											</span>
										</div>
									</AccordionTrigger>
									<AccordionContent>
										<div className="flex justify-between items-center">
											<ul className="-mb-8 mt-3">
												{remarks.map((event, eventIdx) => (
													<li key={event.id}>
														<div className="relative pb-8">
															{eventIdx !== remarks.length - 1 ? (
																<span
																	aria-hidden="true"
																	className="absolute left-3 top-4 -ml-px h-full w-0.5 bg-gray-200"
																/>
															) : null}
															<div className="relative flex space-x-3">
																<div>
																	<span
																		className={classNames(
																			event.previousStep?.toLowerCase() ===
																				pipeline.remark?.toLowerCase()
																				? "bg-orange-100"
																				: event.id <=
																						steps.indexOf(
																							pipeline.remark?.toLowerCase()!,
																						) +
																							2
																					? "bg-green-600"
																					: "bg-gray-100",
																			"flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white",
																		)}
																	>
																		{event.previousStep?.toLowerCase() ===
																		pipeline.remark?.toLowerCase() ? (
																			<Loader className="h-3 w-3 text-gray-600 animate-spin" />
																		) : event.id <=
																			steps.indexOf(
																				pipeline.remark?.toLowerCase()!,
																			) +
																				2 ? (
																			<event.icon
																				aria-hidden="true"
																				className="h-3 w-3 text-white"
																			/>
																		) : (
																			<Dot className="h-8 w-8 text-gray-500 animate-pulse" />
																		)}
																	</span>
																</div>
																<div className="flex min-w-0 flex-1 justify-between space-x-4">
																	<div>
																		<p className="text-sm text-gray-600">
																			{event.previousStep?.toLowerCase() ===
																			pipeline.remark?.toLowerCase()
																				? event.content
																				: event.id <=
																						steps.indexOf(
																							pipeline.remark?.toLowerCase()!,
																						) +
																							2
																					? event.completed
																					: event.upcoming}
																		</p>
																	</div>
																</div>
															</div>
														</div>
													</li>
												))}
											</ul>
										</div>
									</AccordionContent>
								</AccordionItem>
							);
						})}
					</Accordion>
				)}
			</ul>
		</div>
	);
}
