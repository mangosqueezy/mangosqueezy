"use server";

import { createClient } from "@/lib/supabase/server";

export async function auth(formData: FormData) {
	const supabase = await createClient();

	const email = formData.get("email") as string;
	const isvalidEmail =
		typeof email === "string" && email.length > 3 && email.includes("@");

	if (!isvalidEmail) {
		return "Please enter your valid email id";
	}

	const { error } = await supabase.auth.signInWithOtp({
		email,
		options: {
			data: {
				slug: email,
				provider: "magic link",
			},
		},
	});

	if (error) {
		return "Something went wrong please try again later";
	}

	return "Please check your inbox";
}
