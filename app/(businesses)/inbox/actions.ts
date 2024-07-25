"use server";

import { EmailTemplate } from "@/components/mango-ui/email-template";
import { Resend } from "resend";
import { Dub } from "dub";
import { getAffiliateByEmail } from "@/models/affiliates";
import { createAffiliateTask } from "@/trigger/create-affiliate";
import { createReplyMessage } from "@/models/messages";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";

const nudgeSchema = z.object({
  nudge: z.string(),
});

const OPENAI_KEY = process.env.OPENAI_KEY;
const HELICONE_API_KEY = process.env.HELICONE_API_KEY;

export async function sendEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const productId = formData.get("product-id") as string;
  const emailContent = formData.get("email-content") as string;
  const isAffiliateLink = formData.get("is-affiliate-link") as string;
  const businessId = formData.get("business-id") as string;
  const parentId = formData.get("parent-id") as string;

  const affiliateLink = `https://mangosqueezy.com/buy/${email}/${productId}`;

  let parsedEmailContent = `
    ${emailContent}
    `;

  const affiliateInfo = await getAffiliateByEmail(email);

  if (isAffiliateLink === "true") {
    const dub = new Dub({
      token: process.env.DUBCO_API_KEY,
    });

    const dubResponse = await dub.links.upsert({
      url: affiliateLink,
    });

    const matchedAffiliateBusiness = affiliateInfo?.affiliate_business.find(
      affiliate => affiliate.affiliate_link === dubResponse.shortLink
    );

    if (!matchedAffiliateBusiness) {
      parsedEmailContent = `
      ${emailContent}

      Here is the affiliate link ${dubResponse.shortLink}. Now you can share it with your audience and grow.
      `;

      if (!affiliateInfo?.id) {
        // trigger background job to create the affiliate profile in our database
        await createAffiliateTask.trigger({
          first_name: name,
          businessId,
          email,
        });
      }
    }
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: "mangosqueezy <amit@tapasom.com>",
    to: [email],
    subject: "Grow Together: Influencer Partnership",
    reply_to: process.env.SLACK_REPLY_TO,
    react: EmailTemplate({ firstName: "there", text: parsedEmailContent }) as React.ReactElement,
  });

  await createReplyMessage({
    name,
    email,
    subject: "Grow Together: Influencer Partnership",
    message: parsedEmailContent,
    message_id: data?.id as string,
    type: "email",
    business_id: businessId,
    parent_id: parentId,
  });

  return { data, error };
}

export async function sendNudge(formData: FormData) {
  const name = formData.get("name") as string;
  const businessId = formData.get("business-id") as string;
  const parentId = formData.get("parent-id") as string;
  const channelId = formData.get("channel-id") as string;
  const videoId = formData.get("video-id") as string;

  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // to get refresh token refer postman collection
  oAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  const response = await oAuth2Client.getAccessToken();
  const accessToken = response.token;

  const model = new ChatOpenAI({
    apiKey: OPENAI_KEY,
    model: "gpt-4o",
    temperature: 0.9,
    configuration: {
      basePath: "https://oai.hconeai.com/v1",
      defaultHeaders: {
        "Helicone-Auth": `Bearer ${HELICONE_API_KEY}`,
      },
    },
  });

  const modelWithStructuredOutput = model.withStructuredOutput(nudgeSchema);

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful comment assistant"],
    [
      "user",
      `
          Please create a super short, personalized YouTube comment (less than 10,000 characters) that sounds human and not like AI. The comment should be from a business named mangosqueezy and express interest in partnering with an influencer:

          1. Start with "Hi there".
          2. Express mangosqueezy's interest in collaborating with the influencer.
          3. Invite the influencer to reply to the amit@tapasom.com to start the partnership process and ask them to provide their XRPL wallet address and channel Id.

          Include mangosqueezy in the signature.

          Thank you!`,
    ],
  ]);

  const chain = prompt.pipe(modelWithStructuredOutput);
  const result = await chain.invoke({});

  const nudgeResponse = await fetch(
    "https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet,id,replies",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        snippet: {
          channelId: channelId,
          videoId: videoId,
          topLevelComment: {
            snippet: {
              textOriginal: result.nudge,
            },
          },
        },
      }),
    }
  );

  const nudgeResult = await nudgeResponse.json();

  await createReplyMessage({
    name,
    channel_id: channelId,
    video_id: videoId,
    subject: "Grow Together: Influencer Partnership",
    message: result.nudge,
    message_id: nudgeResult?.id as string,
    type: "nudge",
    business_id: businessId,
    parent_id: parentId,
  });

  return { nudgeResult };
}
