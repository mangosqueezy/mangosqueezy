"use server";

import { Prisma } from "@prisma/client";
import type { Affiliates, Affiliate_Business } from "@prisma/client";
import prisma from "@/lib/prisma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";

type TAffiliates = Pick<
  Affiliates,
  | "first_name"
  | "last_name"
  | "email"
  | "description"
  | "social_media_profiles"
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
  social_media_profiles,
  wallet_address,
  email,
}: TAffiliates) {
  try {
    const vectorStore = PrismaVectorStore.withModel<Affiliates>(prisma).create(
      new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_KEY,
        batchSize: 512,
        model: "text-embedding-3-large",
        configuration: {
          baseURL: "https://oai.hconeai.com/v1",
          defaultHeaders: {
            "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
          },
        },
      }),
      {
        prisma: Prisma,
        tableName: "Affiliates",
        vectorColumnName: "embedding",
        columns: {
          id: PrismaVectorStore.IdColumn,
          first_name: PrismaVectorStore.ContentColumn,
          last_name: PrismaVectorStore.ContentColumn,
          description: PrismaVectorStore.ContentColumn,
          wallet_address: PrismaVectorStore.ContentColumn,
          social_media_profiles: PrismaVectorStore.ContentColumn,
          email: PrismaVectorStore.ContentColumn,
        },
      },
    );

    const affiliatesInfo = [
      {
        first_name,
        last_name,
        description,
        wallet_address,
        social_media_profiles: social_media_profiles as Prisma.JsonObject,
        email,
      },
    ];

    const insertedAffiliates = await prisma.$transaction(
      affiliatesInfo.map((affiliate) =>
        prisma.affiliates.create({
          data: {
            first_name: affiliate.first_name,
            last_name: affiliate.last_name,
            description: affiliate.description,
            wallet_address: affiliate.wallet_address,
            social_media_profiles:
              affiliate.social_media_profiles as Prisma.JsonObject,
            email: affiliate.email,
          },
        }),
      ),
    );
    await vectorStore.addModels(insertedAffiliates);

    return insertedAffiliates;
  } catch (err) {
    console.log(err);
  }
}

export async function udpateAffiliateStatus(
  email: Affiliates["email"],
  status: Affiliates["status"],
) {
  return prisma.affiliates.update({
    where: {
      email,
    },
    data: {
      status,
    },
  });
}

type TAffiliateBusiness = Omit<Affiliate_Business, "id">;

export async function createAffiliateBusiness({
  business_id,
  affiliate_id,
}: TAffiliateBusiness) {
  try {
    return prisma.affiliate_Business.create({
      data: {
        business_id,
        affiliate_id,
      },
    });
  } catch (err) {
    console.log(err);
  }
}
