export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { description, pipeline_id, affiliate_count } = body;

		await fetch(
			`https://mangosqueezy-hono-app-76817065059.us-central1.run.app/api/search-ig-user?q=${description}&affiliateCount=${affiliate_count}&pipeline_id=${pipeline_id}&difficulty=medium`,
			{
				method: "GET",
			},
		);

		return new Response("Job started", { status: 200 });
	} catch (_) {
		return new Response("Job failed", { status: 400 });
	}
}
