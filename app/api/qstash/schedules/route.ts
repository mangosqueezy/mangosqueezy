import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

export const POST = verifySignatureAppRouter(async (req: Request) => {
	const body = await req.json();

	return new Response(JSON.stringify(body));
});
