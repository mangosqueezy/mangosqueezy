export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const hubChallenge = searchParams.get("hub.challenge");
	const hubVerifyToken = searchParams.get("hub.verify_token");

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

	const messaging = jsonBody?.entry[0].messaging;

	const message = messaging[0];

	console.log("/api/webhook/ig/ POST => ", message);

	return new Response("Received", { status: 200 });
}
