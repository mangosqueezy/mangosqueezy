import prisma from "@/lib/prisma";
import type { ChatMessage } from "@prisma/client";

type TChatMessage = Pick<
	ChatMessage,
	"pipeline_id" | "text" | "sender" | "receiver"
>;

export async function createChatMessage({
	pipeline_id,
	text,
	sender,
	receiver,
}: TChatMessage) {
	return prisma.chatMessage.create({
		data: {
			pipeline_id,
			text,
			sender,
			receiver,
		},
	});
}

export async function getChatMessages({
	pipeline_id,
}: { pipeline_id: number }) {
	return prisma.chatMessage.findMany({
		where: { pipeline_id },
		orderBy: { created_at: "desc" },
	});
}
