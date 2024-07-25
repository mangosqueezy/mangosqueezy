import { logger, task } from "@trigger.dev/sdk/v3";
import prisma from "@/lib/prisma";
import { createAffiliateBusiness } from "@/models/affiliates";

export const createAffiliateTask = task({
  id: "create-affiliate-task",
  run: async (payload: any, { ctx }) => {
    logger.log("Create affiliate task...", { payload, ctx });

    const { first_name, wallet_address, email } = payload;

    const affiliatesResult = await prisma.affiliates.create({
      data: {
        first_name,
        wallet_address,
        email,
      },
    });

    // add your own store business_id for eg - uuid from business table
    const business_id = process.env.MANGO_SQUEEZY_BUSINESS_ID!;

    await createAffiliateBusiness({
      affiliate_id: affiliatesResult.id,
      business_id,
    });

    return { affiliate_id: affiliatesResult.id };
  },
});
