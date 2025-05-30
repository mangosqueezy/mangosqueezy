import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	return await updateSession(request);
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * Feel free to modify this pattern to include more paths.
		 */
		"/((?!_proxy/squzy/track|api|login|buy|auth|join|pricing|screenshots|map|logo-cluster|success|error|privacy|terms|_next/static|_next/image|favicon.ico|$).*)",
	],
};
