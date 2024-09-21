"use client";
import { useState } from "react";

import useStore from "@/app/store/store";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { MapPin } from "lucide-react";
import type { LocationNode as LocationNodeProps } from "../types/appNode";

export default function LocationNode({
	id,
	isConnectable,
}: NodeProps<LocationNodeProps>) {
	const updateNodeData = useStore((state) => state.updateNodeData);
	const [location, setLocation] = useState("global");

	return (
		<div className="h-full border border-gray-300 rounded bg-white">
			<div className="bg-indigo-300 p-2 rounded-t">
				<div className="flex items-center">
					<MapPin className="h-5 w-5 mr-2" />
					<span className="text-sm font-medium text-gray-700">Location</span>
				</div>
			</div>
			<div className="p-2">
				<label
					className="block text-sm font-medium text-gray-700 mb-1"
					htmlFor="location"
				>
					Location:
				</label>
				<input
					id="location"
					name="location"
					type="text"
					value={location}
					onChange={(e) => {
						setLocation(e.target.value);
						updateNodeData(id, e.target.value);
					}}
					className="nodrag w-full p-1.5 border border-gray-300 rounded"
				/>
			</div>
			<Handle
				type="source"
				position={Position.Bottom}
				id="g"
				isConnectable={isConnectable}
			/>
		</div>
	);
}
