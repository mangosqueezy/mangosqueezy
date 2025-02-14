import type { AppNode } from "../types/appNode";

export const initialNodes = [
	{
		id: "node-1",
		type: "inputProduct",
		position: { x: 400, y: 0 },
		targetPosition: "top",
		data: { value: "", label: "Product" },
	},
	{
		id: "node-2",
		type: "inputAffiliate",
		position: { x: 400, y: 200 },
		targetPosition: "top",
		data: { value: "3", label: "Affiliate" },
	},
	{
		id: "node-4",
		type: "output",
		targetPosition: "top",
		position: { x: 400, y: 450 },
		data: { label: "Output" },
	},
] as AppNode[];
