"use server";

import prisma from "@/lib/prisma";

export async function getAffiliateBusinessInfoById(business_id: string, affiliate_id: number) {
  return prisma.affiliate_Business.findFirst({
    where: {
      business_id: business_id,
      affiliate_id: affiliate_id,
    },
    select: {
      affiliate: {
        select: {
          email: true,
          wallet_address: true,
        },
      },
      business: {
        select: {
          email: true,
          commission: true,
          wallet_address: true,
          svix_consumer_app_id: true,
        },
      },
    },
  });
}