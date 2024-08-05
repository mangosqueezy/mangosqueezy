"use server";

import { createOrder } from "@/models/orders";
import { payoutTask } from "@/trigger/payout-job";
import { Svix } from "svix";

const SVIX_APP_ID = process.env.SVIX_APP_ID;
const SVIX_API_KEY = process.env.SVIX_API_KEY;
const svix = new Svix(SVIX_API_KEY!);

export async function createOrderAction(formData: FormData) {
  const email = formData.get("email") as string;
  const business_id = formData.get("business_id") as string;
  const product_id = formData.get("product_id") as string;
  const affiliate_id = formData.get("affiliate_id") as string;

  try {
    await createOrder({
      email,
      business_id,
      product_id,
      affiliate_id,
    });

    await payoutTask.trigger({
      amount: "20",
      business_wallet_address: "rwTBPv3uZc6Pja9QZFmZ1aNYZg2zMPHHzV",
      affiliate_wallet_address: "rssgKvkHxR8h8QwTsm3dYUtT7UDwTmbwhM",
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
  } catch (err) {
    console.error(err);
  }

  return "success";
}
