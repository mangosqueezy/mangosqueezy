"use client";
import { useState } from "react";

import useStore from "@/app/store/store";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { FileText } from "lucide-react";
import type { FormatNode as FormatNodeProps } from "../types/appNode";

export default function FormatNode({
	id,
	isConnectable,
}: NodeProps<FormatNodeProps>) {
	const updateNodeData = useStore((state) => state.updateNodeData);
	const [format, setFormat] = useState(`Generate a caption and hashtags in the following format:

Hook (First Line): Start with a question or attention-grabbing statement.
Main Content (Tell a Story or Share Value): Describe the benefits of the product, service, or promotion in an engaging way.
Call-to-Action (CTA): End with a clear call to action.
Emojis: Use emojis to enhance the post and highlight key points.
Hashtags: Include 8-12 relevant hashtags in one line.
Format Requirements:

Use line breaks for clarity.
Maintain a visually appealing structure.`);

	return (
		<div className="h-full w-80 border border-gray-300 rounded bg-white">
			<div className="bg-rose-300 p-2 rounded-t">
				<div className="flex items-center">
					<FileText className="h-5 w-5 mr-2" />
					<span className="text-sm font-medium text-gray-700">Format</span>
				</div>
			</div>
			<div className="p-2">
				<label
					className="block text-sm font-medium text-gray-700 mb-1"
					htmlFor="format"
				>
					Format:
				</label>
				<textarea
					id="format"
					name="format"
					value={format}
					rows={5}
					onChange={(e) => {
						setFormat(e.target.value);
						updateNodeData(id, e.target.value);
					}}
					disabled={true}
					className="nodrag w-full p-1.5 border border-gray-300 rounded cursor-not-allowed bg-gray-100"
				/>
			</div>
			<Handle
				type="target"
				position={Position.Top}
				id="l"
				isConnectable={isConnectable}
			/>
			<Handle
				type="source"
				position={Position.Bottom}
				id="m"
				isConnectable={isConnectable}
			/>
		</div>
	);
}
