import prisma from "@/lib/prisma";

export const createIgScopeIdentifier = async ({
	recipient_id,
}: { recipient_id: string }) => {
	return prisma.ig_scope_identifiers.upsert({
		where: {
			ig_scope_identifier: recipient_id,
		},
		update: {},
		create: {
			ig_scope_identifier: recipient_id,
		},
	});
};

export const getAvailableIgScopeIdentifier = async (take = 3) => {
	return prisma.ig_scope_identifiers.findMany({
		where: {
			pipelines: {
				none: {},
			},
		},
		include: {
			pipelines: true,
		},
		take,
	});
};

export const getCompletedPipelineAffiliates = async (take = 3) => {
	return prisma.ig_scope_identifiers.findMany({
		where: {
			pipelines: {
				some: {
					status: "completed",
				},
			},
		},
		include: {
			pipelines: true,
		},
		take,
	});
};
