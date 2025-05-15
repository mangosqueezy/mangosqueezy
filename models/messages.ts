"use server";

import prisma from "@/lib/prisma";
import type { Messages } from "@/prisma/app/generated/prisma/client";

type TMessages = Pick<
	Messages,
	"name" | "subject" | "message" | "type" | "business_id" | "message_id"
> & {
	email?: string;
	channel_id?: string;
	video_id?: string;
	parent_id?: string;
};

export async function createMessage({
	channel_id,
	video_id,
	name,
	email,
	subject,
	message,
	type,
	business_id,
	message_id,
}: TMessages) {
	return prisma.messages.create({
		data: {
			name,
			email,
			subject,
			message,
			message_id,
			video_id,
			channel_id,
			type,
			business_id,
		},
	});
}

export async function getMessages({
	business_id,
}: { business_id: Messages["business_id"] }) {
	return prisma.messages.findMany({
		where: {
			business_id,
			parent_id: null, // fetch only main messages
		},
		include: {
			replies: {
				orderBy: {
					sent_at: "asc", // Order replies by sent_at in desc order
				},
			},
		},
		orderBy: {
			sent_at: "desc",
		},
	});
}

export async function createReplyMessage({
	channel_id,
	video_id,
	name,
	email,
	subject,
	message,
	type,
	business_id,
	message_id,
	parent_id,
}: TMessages) {
	return prisma.messages.create({
		data: {
			name,
			email,
			subject,
			message,
			message_id,
			video_id,
			channel_id,
			type,
			business_id,
			parent_id,
		},
	});
}
