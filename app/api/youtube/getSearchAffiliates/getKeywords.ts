import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

type GetKeywordsProps = {
	description: string;
};

export async function getKeywords({ description }: GetKeywordsProps) {
	try {
		const prompt = `
You are an expert in social media marketing and affiliate recruitment. Based on the given product description, generate highly targeted search keywords to help find influencers or affiliates on social media who are likely to promote the product effectively. Output the results in list format.

Product Description:
${description}
		`;

		const result = await generateObject({
			model: google("gemini-2.0-flash"),
			prompt: prompt,
			schema: z.object({
				keywords: z.array(z.string()),
			}),
		});

		return {
			keywords: result.object?.keywords || [],
		};
	} catch (_) {
		return {
			keywords: [],
		};
	}
}
