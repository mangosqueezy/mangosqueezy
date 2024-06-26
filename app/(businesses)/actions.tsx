"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserById } from "@/models/business";

export async function getUser() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();

  let user;

  if (error) {
    return user;
  } else {
    user = await getUserById(data.user?.id);
  }

  return user;
}
