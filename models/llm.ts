"use server";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const OPENAI_KEY = process.env.OPENAI_KEY;

export async function mangosqueezyAI(query: string, text: string) {
	const descriptionSchema = z.object({
		description: z.string().describe("description"),
	});

	const model = new ChatOpenAI({
		apiKey: OPENAI_KEY,
		model: "gpt-4o",
		temperature: 0.8,
	});

	const structuredLlm = model.withStructuredOutput(descriptionSchema, {
		name: "descriptionSchema",
	});

	const result = await structuredLlm.invoke(`${query} : ${text}`);

	const { description } = result;

	return description;
}

export const getSlug = async (inputText: string) => {
	const slugSchema = z.object({
		slug: z.string().describe("Slug name"),
	});

	const model = new ChatOpenAI({
		apiKey: OPENAI_KEY,
		model: "gpt-4o",
		temperature: 0,
	});

	const structuredLlm = model.withStructuredOutput(slugSchema);

	const result = await structuredLlm.invoke(
		`Give me a one-word fancy name for the slug derived from the email ID mentioned in the text. : ${inputText}`,
	);

	const { slug } = result;
	return slug;
};
