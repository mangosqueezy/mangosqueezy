import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const description: string = searchParams.get("description") || "";
		const pipeline_id: string = searchParams.get("pipeline_id") || "";
		const affiliate_count: string = searchParams.get("affiliate_count") || "10";

		const result = await fetch(
			`https://mangosqueezy-hono-app-76817065059.us-central1.run.app/api/search-ig-user?q=${description}&affiliateCount=${affiliate_count}&pipeline_id=${pipeline_id}&difficulty=medium`,
			{
				method: "GET",
			},
		);

		return NextResponse.json(result, { status: 200 });
	} catch (_) {
		return NextResponse.json(
			{ error: "something went wrong" },
			{ status: 400 },
		);
	}
}
