"use client";
import { useState } from "react";

import useStore from "@/app/store/store";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Brain, CircleHelp } from "lucide-react";
import type { AskAINode as AskAINodeProps } from "../types/appNode";

export default function AskAINode({
	id,
	isConnectable,
}: NodeProps<AskAINodeProps>) {
	const updateNodeData = useStore((state) => state.updateNodeData);
	const [prompt, setPrompt] = useState(
		"Seeking Ideas: How to Find the Right Affiliates for Our Subscription-Based SaaS Product",
	);
	const [context, setContext] = useState(
		"We’re expanding the affiliate program for [Your SaaS Product], a subscription-based tool designed to help [target market, e.g., businesses, freelancers] with [key benefits, e.g., productivity, collaboration]. To maximize growth, we’re looking for insights on which types of affiliates or categories are most effective at promoting subscription-based products. We want to partner with affiliates who can best reach our target audience and highlight our product’s value.",
	);

	return (
		<div className="h-full border border-gray-300 rounded bg-white">
			<div className="bg-green-300 p-2 rounded-t">
				<div className="flex items-center">
					<Brain className="h-5 w-5 mr-2" />
					<span className="text-sm font-medium text-gray-700">Ask AI</span>
				</div>
			</div>
			<div className="p-2">
				<label
					className="block text-sm font-medium text-gray-700 mb-1"
					htmlFor="textarea"
				>
					Prompt:
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<CircleHelp className="h-4 w-4 ml-1" />
							</TooltipTrigger>
							<TooltipContent>
								<p>{`Write a prompt to let the system know what you're looking for in affiliates or any specific requirements you have.`}</p>
								<p>{`If you don't have anything to share, feel free to leave it blank...`}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</label>
				<textarea
					id="textarea"
					name="textarea"
					onChange={(e) => {
						setPrompt(e.target.value);
						updateNodeData(id, e.target.value);
					}}
					value={prompt}
					className="nodrag w-full p-1.5 border border-gray-300 rounded text-sm"
				/>
			</div>
			<div className="p-2">
				<label
					className="block text-sm font-medium text-gray-700 mb-1"
					htmlFor="context"
				>
					Context:
				</label>
				<textarea
					id="context"
					name="context"
					onChange={(e) => {
						setContext(e.target.value);
						updateNodeData(id, e.target.value);
					}}
					value={context}
					className="nodrag w-full p-1.5 border border-gray-300 rounded text-sm"
				/>
			</div>

			<Handle
				type="target"
				position={Position.Top}
				id="d"
				isConnectable={isConnectable}
			/>
			<Handle
				type="source"
				position={Position.Bottom}
				id="e"
				isConnectable={isConnectable}
			/>
		</div>
	);
}
