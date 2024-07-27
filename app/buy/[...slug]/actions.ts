"use server";

import { createOrder } from "@/models/orders";

export async function createOrderAction(formData: FormData) {
  const email = formData.get("email") as string;
  const business_id = formData.get("business_id") as string;
  const product_id = formData.get("product_id") as string;
  const affiliate_id = formData.get("affiliate_id") as string;

  await createOrder({
    email,
    business_id,
    product_id,
    affiliate_id,
  });

  return "success";
}
