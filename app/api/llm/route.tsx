import { NextResponse } from "next/server";
import { mangosqueezyAI } from "@/models/llm";

export async function GET() {
  return NextResponse.json({ result: "llm-mangosqueezy-ai" }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = await request.formData();
    const query: string = body.get("query") as string;
    const text: string = body.get("text") as string;

    const result = await mangosqueezyAI(query, text);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "something went wrong" }, { status: 400 });
  }
}
