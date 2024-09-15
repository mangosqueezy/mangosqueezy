import type { AppNode } from "../types/appNode";

export const initialNodes = [
	{
		id: "node-1",
		type: "inputProduct",
		position: { x: 200, y: 0 },
		data: { value: "", label: "Product" },
	},
	{
		id: "node-2",
		type: "inputAffiliate",
		position: { x: 200, y: 200 },
		targetPosition: "top",
		data: { value: "3", label: "Affiliate" },
	},
	{
		id: "node-3",
		type: "inputAskAI",
		targetPosition: "top",
		position: { x: 200, y: 400 },
		data: {
			value:
				"Seeking Ideas: How to Find the Right Affiliates for Our Subscription-Based SaaS Product",
			label: "Ask AI",
			context:
				"We’re expanding the affiliate program for [Your SaaS Product], a subscription-based tool designed to help [target market, e.g., businesses, freelancers] with [key benefits, e.g., productivity, collaboration]. To maximize growth, we’re looking for insights on which types of affiliates or categories are most effective at promoting subscription-based products. We want to partner with affiliates who can best reach our target audience and highlight our product’s value.",
		},
	},
	{
		id: "node-4",
		type: "output",
		targetPosition: "top",
		position: { x: 200, y: 800 },
		data: { label: "Output" },
	},
] as AppNode[];
