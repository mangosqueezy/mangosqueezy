import { createClient } from "@/lib/supabase/server";

export async function POST() {
	const supabase = await createClient();
	const { error } = await supabase.auth.signOut();

	if (error) {
		return new Response(null, { status: 500 });
	}

	return new Response("success", { status: 200 });
}
