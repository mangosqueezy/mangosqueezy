"use server";
import prisma from "@/lib/prisma";
import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { OpenAIEmbeddings } from "@langchain/openai";
import type { PriceType, Products } from "@prisma/client";
import { Prisma } from "@prisma/client";

export async function createProduct(
	name: string,
	price: string,
	description: string,
	imageUrl: string,
	businessId: string,
	htmlDescription: string,
	priceType: string,
	isShippable: string,
) {
	try {
		const parsedPrice = Number.parseFloat(price);

		const vectorStore = PrismaVectorStore.withModel<Products>(prisma).create(
			new OpenAIEmbeddings({
				apiKey: process.env.OPENAI_KEY,
				batchSize: 512,
				model: "text-embedding-3-large",
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
					html_description: PrismaVectorStore.ContentColumn,
					image_url: PrismaVectorStore.ContentColumn,
					business_id: PrismaVectorStore.ContentColumn,
					metadata: PrismaVectorStore.ContentColumn,
					price_type: PrismaVectorStore.ContentColumn,
					is_shippable: PrismaVectorStore.ContentColumn,
				},
			},
		);

		const productsInfo = [
			{
				name,
				price: parsedPrice,
				description,
				htmlDescription,
				imageUrl: imageUrl,
				businessId: businessId,
				metadata: { price: parsedPrice },
				priceType: priceType as PriceType,
				isShippable: isShippable === "true",
			},
		];

		await vectorStore.addModels(
			await prisma.$transaction(
				productsInfo.map((product) =>
					prisma.products.create({
						data: {
							name: product.name,
							price: parsedPrice,
							description: product.description,
							html_description: product.htmlDescription,
							image_url: product.imageUrl,
							business_id: product.businessId,
							metadata: product.metadata,
							price_type: product.priceType,
							is_shippable: product.isShippable,
						},
					}),
				),
			),
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
	imageUrl: Products["image_url"],
	htmlDescription: Products["html_description"],
	priceType: Products["price_type"],
	isShippable: Products["is_shippable"],
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
			html_description: htmlDescription,
			price_type: priceType,
			is_shippable: isShippable,
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
