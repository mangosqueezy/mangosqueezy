"use server";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";

const OPENAI_KEY = process.env.OPENAI_KEY;
const HELICONE_API_KEY = process.env.HELICONE_API_KEY;

export async function mangosqueezyAI(query: string, text: string) {
  const zodSchema = z.object({
    description: z.string().describe("description"),
  });

  const prompt = new ChatPromptTemplate({
    promptMessages: [
      SystemMessagePromptTemplate.fromTemplate(query),
      HumanMessagePromptTemplate.fromTemplate("{text}"),
    ],
    inputVariables: ["text"],
  });

  const llm = new ChatOpenAI({
    openAIApiKey: OPENAI_KEY,
    model: "gpt-4o",
    temperature: 0,
    configuration: {
      basePath: "https://oai.hconeai.com/v1",
      defaultHeaders: {
        "Helicone-Auth": `Bearer ${HELICONE_API_KEY}`,
      },
    },
  });

  // Binding "function_call" below makes the model always call the specified function.
  // If you want to allow the model to call functions selectively, omit it.
  const functionCallingModel = llm.bind({
    functions: [
      {
        name: "output_formatter",
        description: "Should always be used to properly format output",
        parameters: zodToJsonSchema(zodSchema),
      },
    ],
    function_call: { name: "output_formatter" },
  });

  const outputParser = new JsonOutputFunctionsParser();

  const chain = prompt.pipe(functionCallingModel).pipe(outputParser);

  const response = await chain.invoke({
    text,
  });

  const { description } = response as z.infer<typeof zodSchema>;

  return description;
}
