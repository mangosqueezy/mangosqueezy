"use client";
import {
	Background,
	BackgroundVariant,
	Controls,
	MiniMap,
	ReactFlow,
} from "@xyflow/react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import useStore from "@/app/store/store";
import { CustomToast } from "@/components/mango-ui/custom-toast";
import { Button } from "@/components/ui/button";
import { useJune } from "@/hooks/useJune";
import { cn } from "@/lib/utils";
import type { Products } from "@prisma/client";
import { Loader, Play } from "lucide-react";
import Link from "next/link";
import toast, { Toaster, type Toast } from "react-hot-toast";
import {
	createPipelineAction,
	getPipelineByProductIdAndBusinessIdAction,
} from "../actions";
import type {
	AppState,
	AffiliatesNode as TAffiliatesNode,
	AskAINode as TAskAINode,
	InputNode as TInputNode,
	LocationNode as TLocationNode,
} from "../types/appNode";
import AffiliatesNode from "./affiliates-node";
import AskAINode from "./ask-ai-node";
import InputNode from "./input-node";
import LocationNode from "./location-node";

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
	backgroundColor: "#FFFFFF",
};

// we define the nodeTypes outside of the component to prevent re-renderings
// you could also use useMemo inside the component
const nodeTypes = {
	inputProduct: InputNode,
	inputAffiliate: AffiliatesNode,
	inputAskAI: AskAINode,
	inputLocation: LocationNode,
};

function Flow({ products, business_id }: TFlowProps) {
	const analytics = useJune(process.env.NEXT_PUBLIC_JUNE_API_KEY!);
	const [isLoading, setIsLoading] = useState(false);
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

	const pipelineHandler = async () => {
		setIsLoading(true);
		const product = nodes.find((node) => node.id === "node-1") as TInputNode;
		const affiliate = nodes.find(
			(node) => node.id === "node-2",
		) as TAffiliatesNode;
		const askAINode = nodes.find((node) => node.id === "node-3") as TAskAINode;
		const locationNode = nodes.find(
			(node) => node.id === "node-5",
		) as TLocationNode;

		let product_id = Number.parseInt(product.data.value);
		if (product.data.value === "" && products) {
			product_id = products[0].id;
		}
		const prompt = askAINode.data.value;
		const affiliate_count = Number.parseInt(affiliate.data.value);
		const location = locationNode.data.value as string;

		const isPipelineExists = await getPipelineByProductIdAndBusinessIdAction(
			product_id,
			business_id as string,
		);

		if (isPipelineExists) {
			toast.custom((t: Toast) => (
				<CustomToast
					t={t}
					message="Pipeline already created. Please check status page."
					variant="success"
				/>
			));
		} else {
			const result = await createPipelineAction(
				product_id,
				prompt,
				affiliate_count,
				location,
				business_id as string,
			);
			if (result?.id) {
				analytics?.track("pipeline_created", {
					product_id: product?.id,
					business_id: business_id,
					prompt: prompt,
				});
				toast.custom((t: Toast) => (
					<CustomToast
						t={t}
						message="Pipeline created successfully. Please check status page."
						variant="success"
					/>
				));
			}
		}

		setIsLoading(false);
	};

	return (
		<>
			<Toaster position="top-right" />
			<div className="h-screen w-full">
				<div className="flex items-center justify-between space-x-3 px-2 py-2 sm:px-3">
					<div className="text-md font-bold lg:text-3xl text-gray-800">
						AI Affiliate Finder
					</div>

					<div className="flex items-center justify-end space-x-3 px-2 py-2 sm:px-3">
						<Button asChild variant="ghost" className="mr-2">
							<Link href="/pipeline/status">View Status</Link>
						</Button>
						{products?.length ? (
							<Button
								variant="outline"
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
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					nodeTypes={nodeTypes}
					fitView
					style={rfStyle}
				>
					<Controls position="top-left" />
					<MiniMap />
					<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
				</ReactFlow>
			</div>
		</>
	);
}

export default Flow;
