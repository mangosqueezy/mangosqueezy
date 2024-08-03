"use server";

import crypto from "crypto";

export async function getUserHash(userId: string) {
  const secretKey = process.env.INTERCOM_CRYPTO_SECRET_KEY!;
  const userIdentifier = userId;

  const hash = crypto.createHmac("sha256", secretKey).update(userIdentifier).digest("hex");

  return hash;
}
