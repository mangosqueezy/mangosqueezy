import { NextResponse } from "next/server";
import { getAffiliatesBySearchQuery } from "@/models/affiliates";

export async function GET() {
  return NextResponse.json({ result: "affiliates" }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = await request.formData();
    const query: string = body.get("search-query") as string;

    const result = await getAffiliatesBySearchQuery({ searchQuery: query });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "something went wrong" }, { status: 400 });
  }
}
