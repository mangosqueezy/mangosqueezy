import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "edge";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
	return NextResponse.json({ result: "linkedin" }, { status: 200 });
}

export async function POST(request: NextRequest) {
	const body = await request.json();
	const email = body.email.split(",");
	const text = body.text;
	const subject = body.subject;

	const response = await resend.emails.send({
		from: "mangosqueezy <amit@tapasom.com>",
		replyTo: "amit@tapasom.com",
		to: [...email],
		subject,
		text,
	});

	return NextResponse.json({ response });
}
