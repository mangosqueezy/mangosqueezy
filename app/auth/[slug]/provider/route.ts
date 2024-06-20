import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { type CookieOptions, createServerClient } from "@supabase/ssr";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? `/join/${params.slug}`;

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    const sesion = await supabase.auth.getSession();

    const profileParameters = {
      part: "statistics,snippet,topicDetails,status,brandingSettings,contentDetails",
      mine: "true",
    };
    const profileQueryParameter = new URLSearchParams(profileParameters);
    const profileResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?${profileQueryParameter.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${sesion.data.session?.provider_token}`,
        },
      }
    );

    const profileResult = await profileResponse.json();
    const ytChannelHandle = profileResult.items[0].snippet.customUrl;
    const ytChannelId = profileResult.items[0].id;
    if (!error) {
      return NextResponse.redirect(
        `${origin}${next}?ytChannelId=${ytChannelId}&ytChannelHandle=${ytChannelHandle}`
      );
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error?slug=${params.slug}`);
}
