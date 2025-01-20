import { openai } from "@ai-sdk/openai";
import { initLogger, wrapAISDKModel } from "braintrust";

initLogger({
	projectName: "mangosqueezy",
	apiKey: process.env.BRAINTRUST_API_KEY,
});

const model = wrapAISDKModel(openai.chat("o1-mini-2024-09-12"));

type LexiconParserAiProps = {
	query: string;
};

export async function lexiconParserAi({ query }: LexiconParserAiProps) {
	try {
		const prompt = `
You are a skilled query expert specializing in the Bluesky API. Given the input ${query}, your task is to analyze the product description and accurately determine its category—such as technology, finance, health, etc.

Once you have identified the category, generate a precise lexicon query that targets affiliates interested in it. 
The final query should follow the format: "affiliate technology", "affiliate finance", "affiliate health", "interested in technology", "interested in finance", "interested in health", 
something that shows an interest in the category.

Key Considerations:
- Only use || operators.
- Ensure that all keywords and phrases from the original input are preserved.
- Your output must strictly adhere to lexicon query syntax.
- Return only the generated lexicon query without any additional text or explanations.

Focus on accuracy and relevance to maximize affiliate targeting efficiency.
		`;

		const { text } = await model.doGenerate({
			inputFormat: "messages",
			mode: {
				type: "regular",
			},
			prompt: [
				{
					role: "user",
					content: [{ type: "text", text: prompt }],
				},
			],
		});

		return {
			lexiconQuery: text,
		};
	} catch (_) {
		return {
			lexiconQuery: "",
		};
	}
}
