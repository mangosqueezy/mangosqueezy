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
		position: { x: 550, y: 200 },
		data: {
			value: `Generate an engaging Instagram caption using the product description provided.
Based on your product description and location, generate 8-12 relevant hashtags that target your audience and niche.
				`,
			label: "Ask AI",
		},
	},
	{
		id: "node-4",
		type: "output",
		targetPosition: "top",
		position: { x: 400, y: 860 },
		data: { label: "Output" },
	},
	{
		id: "node-5",
		type: "inputLocation",
		position: { x: 550, y: 0 },
		targetPosition: "top",
		data: { value: "EARTH", label: "Location" },
	},
	{
		id: "node-6",
		type: "inputFormat",
		position: { x: 550, y: 500 },
		targetPosition: "top",
		data: {
			value: `Desired format:
<💰 Start with Product ID or Offer Statement>
<Briefly state the commission or earning opportunity>

<Why Join Us?>
<✨ Highlight primary benefit 1>
<✨ Highlight primary benefit 2>

<How It Works?>
<Explain the earning process in simple terms and highlight key earnings with emoji>

<🚀 Introduce any additional product or service, like SaaS, if applicable>
<Describe additional product/service value briefly with an emoji for emphasis>

<👉 Finish with a clear call to action, eg DM us to learn more and start your journey today! 📩>

<Include 8-12 relevant hashtags in one line>`,
			label: "Format",
		},
	},
] as AppNode[];
