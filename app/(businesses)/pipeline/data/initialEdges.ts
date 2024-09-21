import { type Edge, MarkerType } from "@xyflow/react";

export const initialEdges = [
	{
		id: "edge-1",
		source: "node-1",
		target: "node-3",
		sourceHandle: "a",
		animated: true,
	},
	{
		id: "edge-2",
		source: "node-2",
		target: "node-4",
		sourceHandle: "c",
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
	{
		id: "edge-3",
		source: "node-3",
		target: "node-6",
		sourceHandle: "e",
		animated: true,
	},
	{
		id: "edge-4",
		source: "node-5",
		target: "node-3",
		sourceHandle: "g",
		animated: true,
	},
	{
		id: "edge-5",
		source: "node-6",
		target: "node-4",
		sourceHandle: "m",
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
