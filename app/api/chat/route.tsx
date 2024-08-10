import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { chatSchema } from "./schema";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const {
      chat,
      profile,
      video,
      webpagesData,
    }: { chat: string; profile: any; video: any; webpagesData: any; messages: any } =
      await req.json();

    const result = await streamObject({
      model: openai("gpt-4o-mini"),
      schema: chatSchema,
      system: `As a research assistant, assist the user by answering their questions.

      Output should be in the following format in text and not in markdown.

      paragraph1.

      paragraph2.

      paragraph3.
      `,
      prompt: `${chat}

      Here are the affiliate details for your reference:

      Profile data : ${JSON.stringify(profile)}
      Video data : ${JSON.stringify(video)}
      Webpages data : ${JSON.stringify(webpagesData)}
      `,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error(error);
  }
}
