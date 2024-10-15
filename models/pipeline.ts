import prisma from "@/lib/prisma";
import type { Pipelines } from "@prisma/client";

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

export async function updatePipeline(id: number, data: Partial<Pipelines>) {
	try {
		return await prisma.pipelines.update({
			where: { id },
			data,
		});
	} catch (err) {
		console.error(err);
	}
}

export async function getPipelineByVideoId(videoId: string) {
	try {
		return await prisma.pipelines.findFirst({
			where: { heygen_video_id: videoId },
		});
	} catch (err) {
		console.error(err);
	}
}

export async function getPipelineByProductIdAndBusinessId(
	productId: number,
	business_id: string,
) {
	try {
		return await prisma.pipelines.findFirst({
			where: {
				AND: [{ product_id: productId }, { business_id: business_id }],
			},
		});
	} catch (err) {
		console.error(err);
	}
}
