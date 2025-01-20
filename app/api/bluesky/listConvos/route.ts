import { AtpAgent } from "@atproto/api";
import { NextResponse } from "next/server";

const BLUESKY_APP_PASSWORD = process.env.BLUESKY_APP_PASSWORD;

export async function GET() {
	try {
		const agent = new AtpAgent({ service: "https://bsky.social" });

		await agent.login({
			identifier: "amirgal.bsky.social",
			password: BLUESKY_APP_PASSWORD!,
		});

		const proxy = agent.withProxy("bsky_chat", "did:web:api.bsky.chat");

		const listConversations = await proxy.chat.bsky.convo.listConvos({
			limit: 100,
		});

		return NextResponse.json(listConversations, { status: 200 });
	} catch (_) {
		return NextResponse.json(
			{ error: "something went wrong" },
			{ status: 400 },
		);
	}
}
