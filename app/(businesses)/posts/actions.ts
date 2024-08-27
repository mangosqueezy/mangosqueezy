"use server";

import { createPost } from "@/models/posts";
import { revalidatePath } from "next/cache";

export async function createPostAction(
	product_id: number,
	content: string,
	business_id: string,
) {
	const posts = await createPost({ product_id, content, business_id });

	revalidatePath("/posts");

	return posts;
}
