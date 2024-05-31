"use server";

import { Affiliates } from "@prisma/client";
import prisma from "@/lib/prisma";

type TAffiliates = Pick<
  Affiliates,
  | "first_name"
  | "last_name"
  | "email"
  | "description"
  | "url"
  | "wallet_address"
>;

export async function getAffiliateByEmail(email: Affiliates["email"]) {
  return prisma.affiliates.findUnique({
    where: {
      email,
    },
  });
}

export async function getAffiliateById(id: Affiliates["id"]) {
  return prisma.affiliates.findUnique({
    where: {
      id,
    },
  });
}

export async function createAffiliate({
  first_name,
  last_name,
  description,
  url,
  wallet_address,
  email,
}: TAffiliates) {
  try {
    return prisma.affiliates.create({
      data: {
        first_name,
        last_name,
        description,
        wallet_address,
        url,
        email,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

export async function udpateAffiliateStatus(
  id: Affiliates["email"],
  status: Affiliates["status"],
) {
  return prisma.affiliates.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}
