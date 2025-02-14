"use server";

import { createChatMessage } from "@/models/chat_message";

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

	return chatMessage;
}
