"use server";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const descriptionSchema = z.object({
  email: z.string().nullish().describe("The email of the person"),
});

const OPENAI_KEY = process.env.OPENAI_KEY;
const HELICONE_API_KEY = process.env.HELICONE_API_KEY;

// Define a custom prompt to provide instructions and any additional context.
// 1) You can add examples into the prompt template to improve extraction quality
// 2) Introduce additional parameters to take context into account (e.g., include metadata
//    about the document from which the text was extracted.)
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an expert extraction algorithm.
    Extract email IDs from the text.
    An email ID can be identified if it ends with .com, .yahoo, or another real domain name etc.
    If you do not know the value of an attribute asked to extract, return null for that attribute's value.`,
  ],
  ["human", "{text}"],
]);

export async function emailExtractor(formData: FormData) {
  const text = formData.get("chat-messages") as string;

  try {
    const llm = new ChatOpenAI({
      apiKey: OPENAI_KEY,
      model: "gpt-4o",
      temperature: 0.2,
      configuration: {
        basePath: "https://oai.hconeai.com/v1",
        defaultHeaders: {
          "Helicone-Auth": `Bearer ${HELICONE_API_KEY}`,
        },
      },
    });
    const runnable = prompt.pipe(llm.withStructuredOutput(descriptionSchema));

    const result = await runnable.invoke({
      text,
    });

    return {
      extractedDescription: result,
    };
  } catch (error) {
    console.error({ error });
    return {
      extractedDescription: null,
      webpagesData: [],
    };
  }
}
