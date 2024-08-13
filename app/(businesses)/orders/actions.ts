import { updateOrdersById } from "@/models/orders";
import { revalidatePath } from "next/cache";

export async function updateOrderAction(formData: FormData) {
  try {
    const orderId = formData.get("order_id") as string;
    const status = formData.get("status") as string;

    await updateOrdersById(orderId, status);

    revalidatePath("/orders");
    return "success";
  } catch (error) {
    return "failed";
  }
}
