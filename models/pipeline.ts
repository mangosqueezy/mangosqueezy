import prisma from "@/lib/prisma";
import type { Pipelines } from "@prisma/client";

export async function createPipeline({
	product_id,
	prompt,
	affiliate_count,
	location,
	business_id,
	workflow,
	lead = 0,
	click = 0,
	sale = 0,
	locationRadius = "100km",
}: {
	product_id: number;
	prompt: string;
	affiliate_count: number;
	location: string;
	business_id: string;
	workflow: string;
	lead?: number;
	click?: number;
	sale?: number;
	locationRadius?: string;
}) {
	try {
		return await prisma.pipelines.create({
			data: {
				product_id,
				business_id,
				prompt,
				affiliate_count,
				location,
				remark: "mangosqueezy is working on this",
				workflow,
				lead,
				click,
				sale,
				location_radius: locationRadius,
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
			include: {
				products: true,
				business: true,
			},
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

export async function getPipelineById(id: number) {
	try {
		return await prisma.pipelines.findUnique({
			where: { id },
			include: {
				products: true,
				business: true,
			},
		});
	} catch (err) {
		console.error(err);
	}
}

export async function getLatestPipeline() {
	try {
		return await prisma.pipelines.findFirst({
			where: {
				AND: [
					{
						created_at: {
							gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
						},
						ig_post_id: {
							not: null,
						},
					},
				],
			},
			orderBy: {
				created_at: "desc",
			},
		});
	} catch (err) {
		console.error(err);
	}
}

export async function deletePipelineById(id: number) {
	try {
		await prisma.pipelines.delete({
			where: { id },
		});
		return { success: true, error: "" };
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		if (
			message.includes(
				"Foreign key constraint violated on the constraint: `ChatMessage_pipeline_id_fkey`",
			)
		) {
			return {
				success: false,
				error: "you can't delete this pipeline because it has chat messages",
			};
		}
		return { success: false, error: message };
	}
}
