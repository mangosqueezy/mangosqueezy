import { AtpAgent } from "@atproto/api";
import { NextResponse } from "next/server";

const BLUESKY_APP_PASSWORD = process.env.BLUESKY_APP_PASSWORD;

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const actorHandle: string = body.actor;
		const message: string = body.message;
		const pipelineId: string = body.pipelineId;

		if (!actorHandle || !message) {
			return NextResponse.json(
				{ error: "actor and message are required" },
				{ status: 400 },
			);
		}

		const agent = new AtpAgent({ service: "https://bsky.social" });

		await agent.login({
			identifier: "amirgal.bsky.social",
			password: BLUESKY_APP_PASSWORD!,
		});

		const proxy = agent.withProxy("bsky_chat", "did:web:api.bsky.chat");

		const { data } = await agent.getProfile({
			actor: actorHandle,
		});

		const convo = await proxy.chat.bsky.convo.getConvoForMembers({
			members: [data.did],
		});

		const { data: sentMessageData } = await proxy.chat.bsky.convo.sendMessage({
			convoId: convo?.data?.convo?.id,
			message: { text: message },
		});

		return NextResponse.json(sentMessageData, { status: 200 });
	} catch (_) {
		return NextResponse.json(
			{ error: "something went wrong" },
			{ status: 400 },
		);
	}
}
