import { getUserById } from "@/models/business";
import { updatePipeline } from "@/models/pipeline";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(request: Request) {
	const body = await request.json();
	const { business_id, product_id, pipeline_id } = body;

	const business = await getUserById(business_id);

	const product = business?.products.find(
		(product) => product.id === product_id,
	);

	const script = `
    Hi there! I'm reaching out to share the benefits of joining our affiliate program.
    You will earn ${business?.commission}% commission on every sale.

    The product is ${product?.name} - ${product?.description}

    Please let me know if you're interested in joining the program.
    `;
	const { text } = await generateText({
		model: openai("gpt-4o-2024-08-06"),
		system:
			"You are a video script improviser. Analyze the user's script and update the script for the video.",
		prompt: `Analyze this script: ${script}. Provide the updated script, making it more engaging and interesting for the user, and also ensure it is short and concise.`,
	});

	const response = await fetch(
		"https://www.mangosqueezy.com/api/heygen/video",
		{
			method: "POST",
			body: JSON.stringify({ script: text }),
		},
	);

	const videoId = await response.json();

	console.log(videoId);
	console.log(business?.commission);

	await updatePipeline(pipeline_id, {
		heygen_video_id: videoId as string,
	});

	return new Response("Job started", { status: 200 });
}
