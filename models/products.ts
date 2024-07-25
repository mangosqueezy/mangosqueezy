"use server";
import type { Products } from "@prisma/client";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";

export async function createProduct(
  name: string,
  price: string,
  description: string,
  imageUrl: string,
  businessId: string
) {
  try {
    const parsedPrice = parseFloat(price);

    const vectorStore = PrismaVectorStore.withModel<Products>(prisma).create(
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
        tableName: "Products",
        vectorColumnName: "embedding",
        columns: {
          id: PrismaVectorStore.IdColumn,
          name: PrismaVectorStore.ContentColumn,
          price: PrismaVectorStore.ContentColumn,
          description: PrismaVectorStore.ContentColumn,
          image_url: PrismaVectorStore.ContentColumn,
          business_id: PrismaVectorStore.ContentColumn,
          metadata: PrismaVectorStore.ContentColumn,
        },
      }
    );

    const productsInfo = [
      {
        name,
        price: parsedPrice,
        description,
        imageUrl: imageUrl,
        businessId: businessId,
        metadata: { price: parsedPrice },
      },
    ];

    await vectorStore.addModels(
      await prisma.$transaction(
        productsInfo.map(product =>
          prisma.products.create({
            data: {
              name: product.name,
              price: parsedPrice,
              description: product.description,
              image_url: product.imageUrl,
              business_id: product.businessId,
              metadata: product.metadata,
            },
          })
        )
      )
    );
  } catch (err) {
    console.error(err);
  }
}

export async function deleteProductById(id: Products["id"]) {
  return prisma.products.delete({
    where: {
      id,
    },
  });
}

export async function updateProductById(
  id: Products["id"],
  name: Products["name"],
  price: Products["price"],
  description: Products["description"],
  imageUrl: Products["image_url"]
) {
  return prisma.products.update({
    where: {
      id,
    },
    data: {
      name,
      price,
      description,
      image_url: imageUrl,
    },
  });
}

export async function getProductById(id: Products["id"]) {
  return prisma.products.findUnique({
    where: {
      id,
    },
  });
}
