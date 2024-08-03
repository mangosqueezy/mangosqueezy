"use server";

import { createOrder } from "@/models/orders";
import { Svix } from "svix";

const SVIX_APP_ID = process.env.SVIX_APP_ID;
const SVIX_API_KEY = process.env.SVIX_API_KEY;
const svix = new Svix(SVIX_API_KEY!);

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

  await svix.message.create(SVIX_APP_ID!, {
    eventType: "invoice.paid",
    eventId: "evt_Wqb1k73rXprtTm7Qdlr38G",
    payload: {
      type: "invoice.paid",
      product_id,
      status: "paid",
      email,
    },
  });

  return "success";
}
