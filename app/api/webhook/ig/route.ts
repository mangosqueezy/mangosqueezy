import crypto from "node:crypto";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const hubMode = searchParams.get("hub.mode");
	const hubChallenge = searchParams.get("hub.challenge");
	const hubVerifyToken = searchParams.get("hub.verify_token");

	console.log("/api/webhook/ig/ GET => ", hubMode);

	if (hubVerifyToken === process.env.IG_VERIFY_TOKEN) {
		return new Response(hubChallenge, {
			status: 200,
		});
	}

	return new Response("Invalid token", {
		status: 403,
	});
}

export async function POST(request: Request) {
	const signature = request.headers.get("X-Hub-Signature-256");
	const body = await request.text();
	const secret = process.env.INSTAGRAM_WEBHOOK_SECRET;

	if (!signature || !secret) {
		return new Response("Missing signature or secret", { status: 400 });
	}

	const hash = crypto.createHmac("sha256", secret).update(body).digest("hex");
	const expectedSignature = `sha256=${hash}`;

	if (signature !== expectedSignature) {
		return new Response("Invalid signature", { status: 403 });
	}

	const jsonBody = JSON.parse(body);

	console.log("/api/webhook/ig/ POST => ", jsonBody);

	return new Response("Received", { status: 200 });
}
