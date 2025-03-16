import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { Svix } from "svix";

const SVIX_API_KEY = process.env.SVIX_API_KEY;
const svix = new Svix(SVIX_API_KEY!);

export const POST = verifySignatureAppRouter(async (req: Request) => {
	const requestBody = await req.json();

	// responses from qstash are base64-encoded
	const decoded = atob(requestBody?.body);
	const parsedDecodedBody = JSON.parse(decoded);
	const { svix_consumer_app_id, product_id, email } = parsedDecodedBody;
	const sourceMessageId = requestBody?.sourceMessageId;

	await svix.message.create(svix_consumer_app_id, {
		eventType: "invoice.paid",
		eventId: sourceMessageId,
		payload: {
			type: "invoice.paid",
			product_id,
			status: "paid",
			email,
		},
	});

	return new Response("Success!", { status: 200 });
});
