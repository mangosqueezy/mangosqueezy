import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const body = await request.json();
	const { script } = body;

	const response = await fetch("https://api.heygen.com/v2/video/generate", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Api-Key": `${process.env.HEYGEN_API_KEY}`,
		},
		body: JSON.stringify({
			title: "My Title",
			video_inputs: [
				{
					character: {
						type: "avatar",
						avatar_id: process.env.HEYGEN_AVATAR_ID,
						avatar_style: "normal",
					},
					voice: {
						type: "text",
						input_text: script,
						voice_id: "4ecb08e33f7f4259bd544aaeae2fd946",
					},
				},
			],
			test: true,
			callback_id: null,
			dimension: {
				width: 1080,
				height: 1920,
			},
			aspect_ratio: null,
		}),
	});

	const result = await response.json();

	return NextResponse.json(result);
}
