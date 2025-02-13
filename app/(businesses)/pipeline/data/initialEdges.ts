import { type Edge, MarkerType } from "@xyflow/react";

export const initialEdges = [
	{
		id: "edge-1",
		source: "node-1",
		target: "node-2",
		sourceHandle: "a",
		animated: true,
	},
	{
		id: "edge-2",
		source: "node-2",
		target: "node-4",
		sourceHandle: "d",
		markerEnd: {
			type: MarkerType.Arrow,
			width: 20,
			height: 20,
		},
		style: {
			strokeWidth: 2,
		},
		animated: true,
	},
] as Edge[];
