"use server";

import { createAffiliate, getAffiliateByEmail } from "@/models/affiliates";

export async function createAffiliateAction(body: FormData) {
  const first_name = body.get("firstname") as string;
  const last_name = body.get("lastname") as string;
  const email = body.get("email") as string;
  const description = body.get("description") as string;
  const wallet_address = body.get("wallet") as string;
  const url = body.get("url") as string;

  const result = await getAffiliateByEmail(email);

  let message = "success";
  if (result?.id) {
    message = "exists";
  } else {
    try {
      await createAffiliate({
        first_name,
        last_name,
        description,
        url,
        wallet_address,
        email,
      });
    } catch (err) {
      message = "error";
    }
  }

  return message;
}
