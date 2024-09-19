export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const hubMode = searchParams.get("hub.mode");
	const hubChallenge = searchParams.get("hub.challenge");
	const hubVerifyToken = searchParams.get("hub.verify_token");

	console.log("/api/webhook/ig/ GET => ", hubMode);

	if (hubVerifyToken === process.env.INSTAGRAM_VERIFY_TOKEN) {
		return new Response(hubChallenge, {
			status: 200,
		});
	}

	return new Response("Invalid token", {
		status: 403,
	});
}

export async function POST(request: Request) {
	const body = await request.text();

	const jsonBody = JSON.parse(body);

	console.log("/api/webhook/ig/ POST => ", jsonBody);

	return new Response("Received", { status: 200 });
}
