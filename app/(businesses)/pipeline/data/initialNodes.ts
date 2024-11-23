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
			value: `Generate an Instagram caption to propose an affiliate partnership using the given product description. The message should be written in simple and concise English, avoiding complex words. Ensure it is engaging, easy to understand, and formatted as follows:
1.	Hi 👋🏽
2.	Add the generated partnership offer script.
3.	CTA: Encourage the recipient to DM us for more details.
4.	Closing: End with a thank you note and include the sender’s name or business name:

Thanks,
mangosqueezy`,
			label: "Ask AI",
		},
	},
	{
		id: "node-4",
		type: "output",
		targetPosition: "top",
		position: { x: 400, y: 560 },
		data: { label: "Output" },
	},
	{
		id: "node-5",
		type: "inputLocation",
		position: { x: 550, y: 0 },
		targetPosition: "top",
		data: { value: "EARTH", label: "Location" },
	},
] as AppNode[];
