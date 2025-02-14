"use server";

import { EmailTemplate } from "@/components/mango-ui/email-template";
import { createChatMessage } from "@/models/chat_message";
import { Resend } from "resend";

export async function createChatMessageAction(
	pipeline_id: number,
	message: string,
	receiver: string,
) {
	const chatMessage = await createChatMessage({
		pipeline_id,
		text: message,
		sender: "amit@tapasom.com",
		receiver: receiver,
	});

	// temporary email notification
	const resend = new Resend(process.env.RESEND_API_KEY);
	await resend.emails.send({
		from: "mangosqueezy <amit@tapasom.com>",
		to: ["amit@tapasom.com"],
		subject: `New message to ${receiver} for pipeline ${pipeline_id}`,
		react: EmailTemplate({
			firstName: "there",
			text: message,
		}) as React.ReactElement,
	});

	return chatMessage;
}
