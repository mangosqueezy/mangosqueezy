"use server";

import prisma from "@/lib/prisma";
import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Prisma } from "@prisma/client";
import type { Affiliate_Business, Affiliates } from "@prisma/client";

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
		include: {
			affiliate_business: true,
		},
	});
}

export async function getAffiliateById(id: Affiliates["id"]) {
	return prisma.affiliates.findUnique({
		where: {
			id,
		},
		include: {
			affiliate_business: true,
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
					description: PrismaVectorStore.ContentColumn,
				},
			},
		);

		const affiliatesResult = await prisma.affiliates.create({
			data: {
				first_name,
				last_name,
				description,
				wallet_address,
				social_media_profiles: social_media_profiles as Prisma.JsonObject,
				email,
			},
		});

		const insertedAffiliates = await prisma.$transaction([
			prisma.affiliates.update({
				where: {
					id: affiliatesResult.id,
				},
				data: {
					description,
				},
			}),
		]);
		await vectorStore.addModels(insertedAffiliates);

		return insertedAffiliates;
	} catch (err) {
		console.error(err);
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

type TAffiliateBusiness = Pick<
	Affiliate_Business,
	| "business_id"
	| "affiliate_id"
	| "product_id"
	| "pipeline_id"
	| "affiliate_link"
	| "affiliate_link_key"
>;

export async function createAffiliateBusiness({
	business_id,
	affiliate_id,
	product_id,
	pipeline_id,
	affiliate_link,
	affiliate_link_key,
}: TAffiliateBusiness) {
	try {
		if (pipeline_id) {
			const result = await prisma.affiliate_Business.create({
				data: {
					business_id,
					affiliate_id,
					product_id,
					pipeline_id,
					affiliate_link,
					affiliate_link_key,
				},
			});

			return result;
		}

		const result = await prisma.affiliate_Business.create({
			data: {
				business_id,
				affiliate_id,
				product_id,
				affiliate_link,
				affiliate_link_key,
			},
		});

		return result;
	} catch (err) {
		console.error(err);
	}
}

export async function getAffiliatesBySearchQuery({
	searchQuery,
}: { searchQuery: string }) {
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
					metadata: PrismaVectorStore.ContentColumn,
				},
				filter: {
					status: {
						equals: "Active",
					},
				},
			},
		);

		const result = await vectorStore.similaritySearch(searchQuery, 20);

		return result;
	} catch (err) {
		console.error(err);
	}
}
