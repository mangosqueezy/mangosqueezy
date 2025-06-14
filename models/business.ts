import prisma from "@/lib/prisma";
import type { Business } from "@prisma/client";

export async function getUserById(id: Business["id"]) {
	try {
		return prisma.business.findUnique({
			where: { id },
			include: {
				affiliate_business: {
					include: {
						affiliate: true,
					},
				},
				products: {
					orderBy: {
						created_at: "desc",
					},
				},
				orders: {
					orderBy: {
						created_at: "desc",
					},
				},
				pipelines: {
					orderBy: {
						created_at: "desc",
					},
				},
			},
		});
	} catch (err) {
		console.error(err);
	}
}

export async function getBusinessBySlug(slug: Business["slug"]) {
	try {
		return prisma.business.findUnique({
			where: { slug },
			include: {
				affiliate_business: {
					include: {
						affiliate: true,
					},
				},
				products: true,
				orders: true,
			},
		});
	} catch (err) {
		console.error(err);
	}
}

export async function updateBusinessInfoById({
	id,
	first_name,
	last_name,
	description,
	commission,
	svix_consumer_app_id,
	url,
}: Pick<
	Business,
	| "id"
	| "first_name"
	| "last_name"
	| "description"
	| "commission"
	| "svix_consumer_app_id"
	| "url"
>) {
	try {
		return prisma.business.update({
			where: { id },
			data: {
				first_name,
				last_name,
				description,
				commission,
				svix_consumer_app_id,
				url,
			},
		});
	} catch (err) {
		console.error(err);
	}
}
