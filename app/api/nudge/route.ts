import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { createMessage } from "@/models/messages";
import { OAuth2Client } from "google-auth-library";

const nudgeSchema = z.object({
  nudge: z.string(),
});

const OPENAI_KEY = process.env.OPENAI_KEY;
const HELICONE_API_KEY = process.env.HELICONE_API_KEY;

export async function GET() {
  return NextResponse.json({ result: "nudge" }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = await request.formData();
    const name: string = body.get("name") as string;
    const businessId = body.get("business_id") as string;
    const channelId = body.get("channel_id") as string;
    const videoId = body.get("video_id") as string;

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

    await createMessage({
      name,
      channel_id: channelId,
      video_id: videoId,
      subject: "Grow Together: Influencer Partnership",
      message: result.nudge,
      message_id: nudgeResult?.id,
      type: "nudge",
      business_id: businessId,
    });

    return Response.json(nudgeResult);
  } catch (error) {
    console.error("error is ", error);
    return Response.json({ error }, { status: 500 });
  }
}
