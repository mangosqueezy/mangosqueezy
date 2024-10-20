"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { classNames, cn } from "@/lib/utils";
import type { Pipelines } from "@prisma/client";
import { ChevronLeft, CircleCheck, Dot, Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import placeholder from "../../../../../public/placeholder.svg";

const steps = [
	"mangosqueezy is working on this",
	"video has been generated",
	"video has been processed for instagram upload",
	"video has been posted to instagram",
	"working on to get affiliates",
];

const remarks = [
	{
		id: 1,
		previousStep: null,
		completed: "started working on this",
		content: "mangosqueezy is working on this",
		upcoming: "mangosqueezy is not working on this",
		icon: CircleCheck,
		iconBackground: "bg-gray-400",
	},
	{
		id: 2,
		previousStep: "mangosqueezy is working on this",
		content: "video generation is currently underway",
		completed: "video has been generated",
		upcoming: "video generation has not begun",
		icon: CircleCheck,
		iconBackground: "bg-blue-500",
	},
	{
		id: 3,
		previousStep: "video has been generated",
		content: "Video is currently being processed for Instagram upload",
		completed: "video has been processed for instagram upload",
		upcoming: "Video has not been processed for Instagram upload",
		icon: CircleCheck,
		iconBackground: "bg-green-500",
	},
	{
		id: 4,
		previousStep: "video has been processed for Instagram upload",
		content: "Instagram upload is currently in progress",
		completed: "video has been posted to instagram",
		upcoming: "Video has not been posted to Instagram",
		icon: CircleCheck,
		iconBackground: "bg-blue-500",
	},
	{
		id: 5,
		previousStep: "video has been posted to Instagram",
		content: "Working on getting affiliates",
		completed: "affiliates have been secured",
		upcoming: "Affiliates have not been secured",
		icon: CircleCheck,
		iconBackground: "bg-green-500",
	},
	{
		id: 6,
		previousStep: "working on to get affiliates",
		content: "Affiliates have been secured",
		completed: "affiliates have been secured",
		upcoming: "Affiliates have not been secured",
		icon: CircleCheck,
		iconBackground: "bg-green-500",
	},
];

const supabase = createClient();

export default function Overview({
	pipelines: pipelinesData,
	userId,
}: {
	pipelines: Pipelines[];
	userId: string | undefined;
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
			<div className="flex justify-between items-center">
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
					Content
				</div>
				<div className="text-md font-semibold text-gray-600 text-center w-full">
					Steps
				</div>
			</div>
			<ul className="divide-y divide-gray-100">
				{pipelines?.length === 0 ? (
					<div className="text-center text-gray-500">No data available</div>
				) : (
					pipelines?.map((pipeline: Pipelines) => (
						<li
							key={pipeline.id}
							className="flex items-center justify-between gap-x-6 py-5 my-5"
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
								<div className="w-96">
									{pipeline.ig_post_url ? (
										<iframe
											className="rounded-xl h-96 w-full"
											src={pipeline.ig_post_url}
											allowFullScreen
											title="Affiliate Video"
										/>
									) : (
										<Image
											src={placeholder}
											alt="Image placeholder"
											className="rounded-xl h-96 w-full"
											width={100}
											height={100}
										/>
									)}
								</div>
								<div className="w-96">
									<div className="flow-root">
										<ul className="-mb-8">
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
								</div>
							</div>
						</li>
					))
				)}
			</ul>
		</div>
	);
}
