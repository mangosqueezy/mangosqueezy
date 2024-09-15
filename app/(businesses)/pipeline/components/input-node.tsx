"use client";
import { useCallback, useState } from "react";

import useStore from "@/app/store/store";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { FileInput } from "lucide-react";
import type { InputNode as InputNodeProps } from "../types/appNode";

export default function InputNode({
	id,
	isConnectable,
}: NodeProps<InputNodeProps>) {
	const updateNodeData = useStore((state) => state.updateNodeData);
	const products = useStore((state) => state.products);
	const [value, setValue] = useState("");

	return (
		<div className="h-full border border-gray-300 rounded bg-white">
			<div className="bg-sky-300 p-2 rounded-t">
				<div className="flex items-center">
					<FileInput className="h-5 w-5 mr-2" />
					<span className="text-sm font-medium text-gray-700">Input</span>
				</div>
			</div>
			<div className="p-2">
				<label
					className="block text-sm font-medium text-gray-700 mb-1"
					htmlFor="select"
				>
					Select product:
				</label>

				<Select
					value={value}
					onValueChange={(value) => {
						setValue(value);
						updateNodeData(id, value);
					}}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Product" />
					</SelectTrigger>
					<SelectContent>
						{products?.map((product) => (
							<SelectItem key={product.id} value={product.id.toString()}>
								{product.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<Handle
				type="source"
				position={Position.Bottom}
				id="a"
				isConnectable={isConnectable}
			/>
		</div>
	);
}
