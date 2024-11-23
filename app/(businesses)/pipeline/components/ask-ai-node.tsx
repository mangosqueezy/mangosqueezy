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
	const [prompt, setPrompt] =
		useState(`Generate an Instagram caption to propose an affiliate partnership using the given product description. The message should be written in simple and concise English, avoiding complex words. Ensure it is engaging, easy to understand, and formatted as follows:
1.	Hi 👋🏽
2.	Add the generated partnership offer script.
3.	CTA: Encourage the recipient to DM us for more details.
4.	Closing: End with a thank you note and include the sender’s name or business name:
		
Thanks,
mangosqueezy`);

	return (
		<div className="h-full w-80 border border-gray-300 rounded bg-white">
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
					rows={5}
					onChange={(e) => {
						setPrompt(e.target.value);
						updateNodeData(id, e.target.value);
					}}
					value={prompt}
					disabled={true}
					className="nodrag w-full p-1.5 border border-gray-300 rounded cursor-not-allowed bg-gray-100"
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
