import { openai } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { embedMany, generateText } from "ai";

const embeddingModel = openai.embedding("text-embedding-ada-002");

const generateChunks = (input: string): string[] => {
	return input
		.trim()
		.split(".")
		.filter((i) => i !== "");
};

export const generateEmbeddings = async (
	value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
	const chunks = generateChunks(value);
	const { embeddings } = await embedMany({
		model: embeddingModel,
		values: chunks,
	});
	return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const createResource = async ({
	content,
	productId,
}: { content: string; productId: number }) => {
	try {
		const { text } = await generateText({
			model: openai("gpt-4o-2024-08-06"),
			system: `You are a knowledge base writer.
				You write simple, clear, and concise content.
				Always include the product ID in the summary, starting the summary with 
				'The summary is about the product with the Product ID: ${productId}'`,
			prompt: `Summarize the following content: ${content}`,
		});

		const embeddings = await generateEmbeddings(text);
		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.SUPABASE_KEY!,
		);

		const { data: existingResource } = await supabase
			.from("resources")
			.select("id")
			.eq("content", text);

		if (!existingResource || existingResource.length === 0) {
			const { data: resource } = await supabase
				.from("resources")
				.insert({
					content: text,
				})
				.select();

			await supabase.from("embeddings").insert(
				embeddings.map((embedding) => ({
					resource_id: resource?.[0]?.id,
					...embedding,
				})),
			);
		}

		return "Resource successfully created.";
	} catch (e) {
		if (e instanceof Error)
			return e.message.length > 0 ? e.message : "Error, please try again.";
	}
};
