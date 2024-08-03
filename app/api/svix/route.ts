import { Svix } from "svix";

const SVIX_APP_ID = process.env.SVIX_APP_ID;
const SVIX_API_KEY = process.env.SVIX_API_KEY;
const svix = new Svix(SVIX_API_KEY!);

export async function POST() {
  const { url, token } = await svix.authentication.appPortalAccess(SVIX_APP_ID!, {});

  return new Response(JSON.stringify({ url, token }));
}
