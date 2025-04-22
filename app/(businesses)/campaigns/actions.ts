"use server";

import { deletePipelineById } from "@/models/pipeline";
import { revalidatePath } from "next/cache";

export async function deletePipelineAction(id: number) {
	try {
		await deletePipelineById(id);
		revalidatePath("/campaigns");
		return { success: true };
	} catch (error) {
		console.error("Error deleting pipeline:", error);
		return { success: false, error: "Failed to delete pipeline" };
	}
}
