"use client";
import { useState } from "react";

import useStore from "@/app/store/store";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Hash } from "lucide-react";
import type { AffiliatesNode as AffiliatesNodeProps } from "../types/appNode";

export default function AffiliatesNode({
	id,
	isConnectable,
}: NodeProps<AffiliatesNodeProps>) {
	const updateNodeData = useStore((state) => state.updateNodeData);
	const [affiliateCount, setAffiliateCount] = useState("3");

	return (
		<div className="h-full border border-gray-300 rounded bg-white">
			<div className="bg-orange-300 p-2 rounded-t">
				<div className="flex items-center">
					<Hash className="h-5 w-5 mr-2" />
					<span className="text-sm font-medium text-gray-700">
						Affiliates Count
					</span>
				</div>
			</div>
			<div className="p-2">
				<label
					className="block text-sm font-medium text-gray-700 mb-1"
					htmlFor="count"
				>
					Count:
				</label>
				<input
					id="count"
					name="count"
					type="number"
					value={affiliateCount}
					onChange={(e) => {
						setAffiliateCount(e.target.value);
						updateNodeData(id, e.target.value);
					}}
					className="nodrag w-full p-1.5 border border-gray-300 rounded"
				/>
			</div>
			<Handle
				type="target"
				position={Position.Top}
				id="c"
				isConnectable={isConnectable}
			/>
			<Handle
				type="source"
				position={Position.Bottom}
				id="d"
				isConnectable={isConnectable}
			/>
		</div>
	);
}
