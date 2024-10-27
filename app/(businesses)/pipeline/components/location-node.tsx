"use client";

import useStore from "@/app/store/store";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { MapPin } from "lucide-react";
import type { LocationNode as LocationNodeProps } from "../types/appNode";
import { CountrySelector } from "./country-selector";

export default function LocationNode({
	id,
	isConnectable,
}: NodeProps<LocationNodeProps>) {
	const updateNodeData = useStore((state) => state.updateNodeData);

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
				<CountrySelector
					defaultValue={"EARTH"}
					onSelect={(countryName) => {
						updateNodeData(id, countryName);
					}}
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
