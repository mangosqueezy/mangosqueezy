import prisma from "@/lib/prisma";

export async function createPipeline({
	product_id,
	prompt,
	affiliate_count,
	format,
	location,
	business_id,
}: {
	product_id: number;
	prompt: string;
	affiliate_count: number;
	format: string;
	location: string;
	business_id: string;
}) {
	try {
		return await prisma.pipelines.create({
			data: {
				product_id,
				business_id,
				prompt,
				affiliate_count,
				format,
				location,
				remark: "mangosqueezy is working on this",
			},
		});
	} catch (err) {
		console.error(err);
	}
}
