import { Svix } from "svix";

const SVIX_API_KEY = process.env.SVIX_API_KEY;
const svix = new Svix(SVIX_API_KEY!);

export async function POST(request: Request) {
	const body = await request.formData();
	const svix_consumer_app_id: string = body.get(
		"svix_consumer_app_id",
	) as string;

	const { url, token } = await svix.authentication.appPortalAccess(
		svix_consumer_app_id,
		{},
	);

	return new Response(JSON.stringify({ url, token }));
}
