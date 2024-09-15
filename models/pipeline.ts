import prisma from "@/lib/prisma";

export async function createPipeline({
	product_id,
	prompt,
	context,
	affiliate_count,
	business_id,
}: {
	product_id: number;
	prompt: string;
	affiliate_count: number;
	context: string;
	business_id: string;
}) {
	try {
		return await prisma.pipelines.create({
			data: {
				product_id,
				business_id,
				prompt,
				affiliate_count,
				context,
				remark: "mangosqueezy is working on this ETA 24-48 hours",
			},
		});
	} catch (err) {
		console.error(err);
	}
}
