import { openai } from "@ai-sdk/openai";
import { CoreUserMessage, LanguageModel, streamObject } from "ai";
import { replySchema } from "./schema";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

import type { TMessages } from "@/app/(businesses)/inbox/components/mail-display";
import { getAffiliateByEmail } from "@/models/affiliates";

function extractMessages(messageObj: TMessages) {
  let result = [];

  // Push the message of the main message object
  result.push(messageObj.message);

  // Iterate over the replies and push their messages
  if (messageObj.replies && messageObj.replies.length > 0) {
    messageObj.replies.forEach(reply => {
      result.push(reply.message);
    });
  }

  return result;
}

export async function POST(req: Request) {
  const context = await req.json();

  const mail: TMessages = JSON.parse(context as string);

  // Extract messages
  const extractedMessages = extractMessages(mail);
  const affiliateInfo = await getAffiliateByEmail(mail?.email as string);

  let joinAffiliateLinkMessage = "";
  if (!affiliateInfo) {
    joinAffiliateLinkMessage = `Let the affiliate know that to start the partnership process, they should join our program by filling out the information at https://mangosqueezy.com/join/mangosqueezy. Please add the link to the message body`;
  }

  const messages: Array<CoreUserMessage> = extractedMessages.map((content: string) => ({
    role: "user",
    content,
  }));

  const result = await streamObject({
    model: openai("gpt-4o") as LanguageModel,
    schema: replySchema,
    system: `As a business, mangosqueezy is sending emails to influencers, expressing our happiness to work with them. We should send this type of email based on past influencer interactions. If past influencer emails are not positive regarding collaboration, create a draft reply based on the previous messages.`,
    messages: [
      ...messages,
      {
        role: "user",
        content: `I need help creating a reply email based on the past email messages. Also, let me know if I should create an affiliate link if the influencer's email is positive. ${joinAffiliateLinkMessage}`,
      },
    ],
  });

  return result.toTextStreamResponse();
}
