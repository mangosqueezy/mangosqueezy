import { getUserById } from "@/models/business";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { generateText } from "ai";

export async function POST(request: Request) {
	const body = await request.json();
	const { business_id, product_id, pipeline_id } = body;
	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL as string,
		process.env.SUPABASE_KEY as string,
	);

	const business = await getUserById(business_id);

	const product = business?.products.find(
		(product) => product.id === product_id,
	);

	const script = `
    Hi there! I'm reaching out to share the benefits of joining our affiliate program.
    You will earn ${business?.commission}% commission on every sale.

    product name: ${product?.name}
	product description: ${product?.description}

    Please let me know if you're interested in joining the program.
    `;
	const { text } = await generateText({
		model: openai("gpt-4o-2024-08-06"),
		system: `You are a script improviser. Analyze the user's script and update the script for the video. Do not add any emojis or hashtags in the final response; just plain text, all in one paragraph.`,
		prompt: `Here is the script: ${script}. Provide the updated script in simple english, making it more engaging and interesting for the user, and also ensure it is short and concise.`,
	});

	const response = await fetch(
		"https://www.mangosqueezy.com/api/heygen/video",
		{
			method: "POST",
			body: JSON.stringify({ script: text }),
		},
	);

	const videoData = await response.json();

	await supabase
		.from("Pipelines")
		.update({
			heygen_video_id: videoData.data.video_id as string,
			remark: "video has been generated",
		})
		.eq("id", pipeline_id)
		.select();

	return new Response("Job started", { status: 200 });
}
