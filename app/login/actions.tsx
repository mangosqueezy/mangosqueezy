"use server";

import { createClient } from "@/lib/supabase/server";
import { getSlug } from "@/models/llm";

export async function auth(_: null | string, formData: FormData) {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const isvalidEmail = typeof email === "string" && email.length > 3 && email.includes("@");

  if (!isvalidEmail) {
    return "Please enter your valid email id";
  }

  const slug = await getSlug(email);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: "https://mangosqueezy.com/api/login",
      data: {
        slug: slug.toLowerCase(),
        provider: "magic link",
      },
    },
  });

  if (error) {
    return "Something went wrong please try again later";
  }

  return "Please check your inbox";
}
