"use server";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";

const OPENAI_KEY = process.env.OPENAI_KEY;
const HELICONE_API_KEY = process.env.HELICONE_API_KEY;

export async function mangosqueezyAI(query: string, text: string) {
  const descriptionSchema = z.object({
    description: z.string().describe("description"),
  });

  const model = new ChatOpenAI({
    apiKey: OPENAI_KEY,
    model: "gpt-4o",
    temperature: 0,
    configuration: {
      basePath: "https://oai.hconeai.com/v1",
      defaultHeaders: {
        "Helicone-Auth": `Bearer ${HELICONE_API_KEY}`,
      },
    },
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
    configuration: {
      basePath: "https://oai.hconeai.com/v1",
      defaultHeaders: {
        "Helicone-Auth": `Bearer ${HELICONE_API_KEY}`,
      },
    },
  });

  const structuredLlm = model.withStructuredOutput(slugSchema);

  const result = await structuredLlm.invoke(
    `Give me a one-word fancy name for the slug derived from the email ID mentioned in the text. : ${inputText}`
  );

  const { slug } = result;
  return slug;
};
