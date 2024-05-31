import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/models/business";

export const dynamic = "auto";

export async function GET(request: NextRequest) {
  const supabase = createClient();

  const { data } = await supabase.auth.getUser();

  const userId = data?.user?.id;

  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const user = await getUserById(userId);

  return NextResponse.json(user, { status: 200 });
}
