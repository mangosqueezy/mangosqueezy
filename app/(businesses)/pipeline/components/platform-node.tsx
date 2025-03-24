"use client";

import useStore from "@/app/store/store";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Handshake } from "lucide-react";
import type { PlatformNode as PlatformNodeProps } from "../types/appNode";
import { PlatformSelector } from "./platform-selector";

export default function PlatformNode({
	id,
	isConnectable,
}: NodeProps<PlatformNodeProps>) {
	const updateNodeData = useStore((state) => state.updateNodeData);

	return (
		<div className="h-full w-64 border border-gray-300 rounded bg-white">
			<div className="bg-indigo-300 p-2 rounded-t">
				<div className="flex items-center">
					<Handshake className="h-5 w-5 mr-2" />
					<span className="text-sm font-medium text-gray-700">Platform</span>
				</div>
			</div>
			<div className="p-2">
				<label
					className="block text-sm font-medium text-gray-700 mb-1"
					htmlFor="platform"
				>
					Platform:
				</label>
				<PlatformSelector
					defaultValue={"instagram"}
					onSelect={(platformName) => {
						updateNodeData(id, platformName);
					}}
				/>
			</div>
			<Handle
				type="target"
				position={Position.Top}
				id="h"
				isConnectable={isConnectable}
			/>
			<Handle
				type="source"
				position={Position.Bottom}
				id="i"
				isConnectable={isConnectable}
			/>
		</div>
	);
}
