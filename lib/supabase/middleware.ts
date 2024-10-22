import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
	const response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});
	const cookieStore = await cookies();

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						for (const { name, value, options } of cookiesToSet) {
							cookieStore.set(name, value, options);
						}
					} catch {
						// The `setAll` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing
						// user sessions.
					}
				},
			},
		},
	);

	const result = await supabase.auth.getUser();

	if (!result.data.user) {
		return NextResponse.redirect(new URL("/login", request.url), {
			headers: request.headers,
		});
	}

	const { data } = await supabase.from("Business").select("commission");

	if (data && data[0]?.commission <= 0) {
		return NextResponse.redirect(new URL("/onboarding", request.url), {
			headers: request.headers,
		});
	}

	return response;
}
