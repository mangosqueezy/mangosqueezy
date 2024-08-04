"use server";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

const descriptionSchema = z.object({
  email: z.string().nullish().describe("The email of the person"),
  urls: z.array(z.string()).nullish().describe("list of social media urls"),
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
    Extract only relevant information such as email IDs and URLs from the text.
    An email ID can be identified if it ends with .com, .yahoo, or another real domain name etc.
    URLs will start with https or other standard protocols.
    If you do not know the value of an attribute asked to extract, return null for that attribute's value.`,
  ],
  ["human", "{text}"],
]);

export async function ytDescriptionExtractor(formData: FormData) {
  const text = formData.get("yt-description") as string;

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

    let webpagesData = [];
    if (result.urls) {
      for (const url of result.urls) {
        const loader = new CheerioWebBaseLoader(url);
        const docs = await loader.load();
        webpagesData.push({
          source: url,
          pageContent: docs[0].pageContent,
        });
      }
    }

    return {
      extractedDescription: result,
      webpagesData,
    };
  } catch (error) {
    console.error({ error });
    return {
      extractedDescription: null,
      webpagesData: [],
    };
  }
}
