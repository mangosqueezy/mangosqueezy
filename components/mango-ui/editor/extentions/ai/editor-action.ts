"use server";

import { openai } from "@ai-sdk/openai";
import { initLogger, wrapAISDKModel } from "braintrust";

initLogger({
	projectName: "mangosqueezy",
	apiKey: process.env.BRAINTRUST_API_KEY,
});

const model = wrapAISDKModel(openai.chat("o1-mini-2024-09-12"));

type Params = {
	input: string;
	context?: string;
};

export async function generateEditorContent({ input, context }: Params) {
	try {
		const { stream: textStream } = await model.doStream({
			inputFormat: "messages",
			mode: {
				type: "regular",
			},
			prompt: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: `
							You are an expert AI assistant specializing in content generation and improvement. Your task is to enhance or modify text based on specific instructions. Follow these guidelines:

        1. Language: Always respond in the same language as the input prompt.
        2. Conciseness: Keep responses brief and precise, with a maximum of 200 characters.

        Format your response as plain text, using '\n' for line breaks when necessary.
        Do not include any titles or headings in your response.
        Begin your response directly with the relevant text or information.
	    Instructions: ${context}
		Here is the input: ${input}`,
						},
					],
				},
			],
			temperature: 0.7,
			responseFormat: {
				type: "text",
			},
		});

		return textStream;
	} catch (error) {
		console.error("Error generating content:", error);
		throw error;
	}
}
