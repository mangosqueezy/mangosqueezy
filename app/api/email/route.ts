import { EmailTemplate } from "@/components/mango-ui/email-template";
import { createMessage } from "@/models/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { NextResponse } from "next/server";
import type * as React from "react";
import { Resend } from "resend";
import { z } from "zod";

const emailSchema = z.object({
	email: z.string(),
});

const OPENAI_KEY = process.env.OPENAI_KEY;

export async function GET() {
	return NextResponse.json({ result: "email" }, { status: 200 });
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
	try {
		const body = await request.formData();
		const email: string = body.get("email-id") as string;
		const name: string = body.get("name") as string;
		const businessId = body.get("business_id") as string;

		const model = new ChatOpenAI({
			apiKey: OPENAI_KEY,
			model: "gpt-4o",
			temperature: 0.9,
		});

		const modelWithStructuredOutput = model.withStructuredOutput(emailSchema);

		const prompt = ChatPromptTemplate.fromMessages([
			["system", "You are a helpful email assistant"],
			[
				"user",
				`
        Please create a personalized email body content that sounds human and not like AI where a business named mangosqueezy wants to partner with an influencer. The email should:

        1. Start with "Hi there".
        2. Begin by thanking the influencer.
        3. Express mangosqueezy's interest in collaborating with the influencer.
        4. Mention the mutual benefits of the collaboration.
        5. Invite the influencer to reply to the email to start the partnership process and ask them to provide their XRPL wallet address, which is mandatory to receive earnings for their work.

        Include mangosqueezy in the signature.

        Thank you!`,
			],
		]);

		const chain = prompt.pipe(modelWithStructuredOutput);
		const result = await chain.invoke({});

		const { data, error } = await resend.emails.send({
			from: "mangosqueezy <amit@tapasom.com>",
			to: [email],
			subject: "Grow Together: Influencer Partnership",
			replyTo: process.env.SLACK_REPLY_TO,
			react: EmailTemplate({
				firstName: "there",
				text: result.email,
			}) as React.ReactElement,
		});

		await createMessage({
			name,
			email,
			subject: "Grow Together: Influencer Partnership",
			message: result.email,
			message_id: data?.id as string,
			type: "email",
			business_id: businessId,
		});

		if (error) {
			return Response.json({ error }, { status: 500 });
		}

		return Response.json(data);
	} catch (error) {
		console.error("error is ", error);
		return Response.json({ error }, { status: 500 });
	}
}
