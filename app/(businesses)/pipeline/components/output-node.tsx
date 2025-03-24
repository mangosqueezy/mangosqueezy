import { Handle, type NodeProps, Position } from "@xyflow/react";
import { CheckCircle } from "lucide-react";

export default function OutputNode({ isConnectable }: NodeProps) {
	return (
		<div className="h-full border border-gray-300 rounded bg-white">
			<div className="bg-green-300 p-2 rounded-t">
				<div className="flex items-center">
					<CheckCircle className="h-5 w-5 mr-2" />
					<span className="text-sm font-medium text-gray-700">Output</span>
				</div>
			</div>
			<div className="p-2">
				<span className="text-sm text-gray-600">Pipeline Complete</span>
			</div>
			<Handle
				type="target"
				position={Position.Top}
				id="j"
				isConnectable={isConnectable}
			/>
		</div>
	);
}
