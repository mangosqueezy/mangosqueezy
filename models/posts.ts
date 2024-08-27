import prisma from "@/lib/prisma";

export async function createPost({
	product_id,
	content,
	business_id,
}: {
	product_id: number;
	content: string;
	business_id: string;
}) {
	try {
		return await prisma.posts.create({
			data: {
				product_id,
				business_id,
				content,
				remark: "mangosqueezy is working on this",
			},
		});
	} catch (err) {
		console.error(err);
	}
}
