import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const parsedAccessToken = searchParams.get("longLivedToken")
    ? searchParams.get("accessToken")
    : searchParams.get("longLivedToken");

  if (parsedAccessToken) {
    const igParameters = {
      fields: "instagram_business_account,about,username",
      access_token: parsedAccessToken as string,
    };
    const igQueryParameter = new URLSearchParams(igParameters);
    const igResponse = await fetch(
      `https://graph.facebook.com/v20.0/me/accounts?${igQueryParameter.toString()}`
    );

    const igResult = await igResponse.json();
    const igUsername = igResult.data[0].username;

    return NextResponse.json({ igUsername }, { status: 200 });
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error?slug=${searchParams.get("state")}`);
}
