"use client";
import useStore from "@/app/store/store";
import { CustomToast } from "@/components/mango-ui/custom-toast";
import { Button } from "@/components/ui/button";
import { useJune } from "@/hooks/useJune";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Products } from "@prisma/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
	Background,
	BackgroundVariant,
	Controls,
	MiniMap,
	ReactFlow,
} from "@xyflow/react";
import { Loader, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast, { Toaster, type Toast } from "react-hot-toast";
import { useShallow } from "zustand/react/shallow";
import {
	createPipelineAction,
	getPipelineByProductIdAndBusinessIdAction,
} from "../actions";
import type {
	AppState,
	AffiliatesNode as TAffiliatesNode,
	InputNode as TInputNode,
	PlatformNode as TPlatformNode,
} from "../types/appNode";
import AffiliatesNode from "./affiliates-node";
import InputNode from "./input-node";
import OutputNode from "./output-node";
import PlatformNode from "./platform-node";

type TFlowProps = {
	products: Array<Products> | null | undefined;
	business_id: string | null | undefined;
};

const selector = (state: AppState) => ({
	nodes: state.nodes,
	edges: state.edges,
	onNodesChange: state.onNodesChange,
	onEdgesChange: state.onEdgesChange,
	onConnect: state.onConnect,
	setProducts: state.setProducts,
});

const rfStyle = {
	backgroundColor: "#F7F9FB",
};

// we define the nodeTypes outside of the component to prevent re-renderings
// you could also use useMemo inside the component
const nodeTypes = {
	inputProduct: InputNode,
	inputAffiliate: AffiliatesNode,
	inputPlatform: PlatformNode,
	output: OutputNode,
};

const supabase = createClient();

function Flow({ products, business_id }: TFlowProps) {
	const analytics = useJune(process.env.NEXT_PUBLIC_JUNE_API_KEY!);
	const [isLoading, setIsLoading] = useState(false);
	const [pipelineId, setPipelineId] = useState<number | null>(null);
	const [jobStatus, setJobStatus] = useState({
		status: "inactive",
		message: "Start the job to find the affiliates",
	});
	const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setProducts } =
		useStore(useShallow(selector));

	useEffect(() => {
		setProducts(products);
	}, [products, setProducts]);

	useEffect(() => {
		if (analytics) {
			analytics.page("Pipeline", {
				business_id,
			});
		}
	}, [analytics, business_id]);

	useEffect(() => {
		let channel: RealtimeChannel;
		if (pipelineId) {
			channel = supabase
				.channel("custom-all-channel")
				.on(
					"postgres_changes",
					{
						event: "UPDATE",
						schema: "public",
						table: "Pipelines",
						filter: `id=eq.${pipelineId}`,
					},
					(payload) => {
						setJobStatus({
							status: payload.new.status,
							message: payload.new.remark,
						});
					},
				)
				.subscribe();
		}

		return () => {
			if (channel) {
				supabase.removeChannel(channel);
			}
		};
	}, [pipelineId]);

	const pipelineHandler = async () => {
		setJobStatus({
			status: "inprogress",
			message: "We are finding the affiliates for you",
		});
		setIsLoading(true);
		const product = nodes.find((node) => node.id === "node-1") as TInputNode;
		const affiliate = nodes.find(
			(node) => node.id === "node-2",
		) as TAffiliatesNode;
		const platform = nodes.find(
			(node) => node.id === "node-3",
		) as TPlatformNode;

		let product_id = Number.parseInt(product.data.value);
		if (product.data.value === "" && products) {
			product_id = products[0].id;
		}
		const affiliate_count = Number.parseInt(affiliate.data.value);

		const isPipelineExists = await getPipelineByProductIdAndBusinessIdAction(
			product_id,
			business_id as string,
		);

		if (isPipelineExists) {
			toast.custom((t: Toast) => (
				<CustomToast
					t={t}
					message="Job already created. We found the affiliates for you."
					variant="success"
				/>
			));

			setJobStatus({
				status: "completed",
				message: "Job already created. We found the affiliates for you.",
			});
		} else {
			const platform_name = platform.data.value.toLowerCase();
			const result = await createPipelineAction(
				product_id,
				"prompt",
				affiliate_count,
				"EARTH",
				business_id as string,
				platform_name,
			);
			if (result?.id) {
				setPipelineId(result.id);
				if (platform_name === "instagram") {
					setJobStatus({
						status: "completed",
						message:
							"We are finding the affiliates for you, we will notify you once we find the affiliates.",
					});
				} else {
					setJobStatus({
						status: "completed",
						message: "Job created successfully. Please check campaign page.",
					});
				}
			}
		}

		setIsLoading(false);
	};

	return (
		<>
			<Toaster position="top-right" />
			<div className="h-screen w-full">
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					nodeTypes={nodeTypes}
					fitView
					nodeOrigin={[0.5, 0.5]}
					fitViewOptions={{
						padding: 0.1,
						minZoom: 0.1,
						maxZoom: 1,
						duration: 200,
						nodes: [{ id: "node-1" }, { id: "node-2" }, { id: "node-4" }],
					}}
					style={rfStyle}
				>
					<Controls position="top-left" />
					<MiniMap />
					<Background variant={BackgroundVariant.Dots} />

					<div className="absolute top-4 right-4 w-80 rounded-lg border bg-white shadow-lg z-10">
						<div className="border-b px-4 py-3">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-medium text-gray-900">Activity</h3>
								<Button asChild variant="ghost" size="sm">
									<Link
										href="/campaigns"
										className="text-orange-600 text-xs  underline decoration-orange-600"
									>
										View Campaigns
									</Link>
								</Button>
							</div>
						</div>

						<div className="px-4 py-4">
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center w-full">
										<span className="relative flex h-2 w-2">
											<span
												className={cn(
													"animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
													jobStatus.status === "inactive"
														? "bg-yellow-400"
														: jobStatus.status === "inprogress"
															? "bg-orange-400"
															: "bg-green-400",
												)}
											/>
											<span
												className={cn(
													"relative inline-flex rounded-full h-2 w-2",
													jobStatus.status === "inactive"
														? "bg-yellow-500"
														: jobStatus.status === "inprogress"
															? "bg-orange-500"
															: "bg-green-500",
												)}
											/>
										</span>
										<span className="text-xs text-gray-500 ml-2">
											{jobStatus.message}
										</span>
									</div>
								</div>
							</div>
						</div>

						<div className="border-t px-4 py-3 flex gap-2 justify-end">
							{products?.length ? (
								<Button
									variant="outline"
									size="sm"
									type="button"
									disabled={isLoading || !products?.length}
									onClick={pipelineHandler}
									className={cn(
										"bg-white px-3 py-2 text-sm font-semibold text-orange-600 ring-1 ring-inset ring-orange-300 bg-orange-200 hover:bg-orange-50",
										isLoading || (!products?.length && "cursor-not-allowed"),
									)}
								>
									{isLoading ? (
										<Loader className="mr-1 h-5 w-5 text-gray-400 animate-spin" />
									) : (
										<Play className="mr-1 h-5 w-5 text-orange-400" />
									)}
									Run
								</Button>
							) : (
								<Button
									asChild
									variant="outline"
									className="bg-orange-200 hover:bg-orange-50 text-orange-600"
								>
									<Link href="/products">Add Products</Link>
								</Button>
							)}
						</div>
					</div>
				</ReactFlow>
			</div>
		</>
	);
}

export default Flow;
