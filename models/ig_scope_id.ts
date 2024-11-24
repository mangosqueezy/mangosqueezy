import prisma from "@/lib/prisma";

export const createIgScopeIdentifier = async ({
	recipient_id,
	ig_username,
}: { recipient_id: string; ig_username: string }) => {
	return prisma.ig_scope_identifiers.upsert({
		where: {
			ig_scope_identifier: recipient_id,
		},
		update: {},
		create: {
			ig_scope_identifier: recipient_id,
			ig_username,
		},
	});
};

export const getAvailableIgScopeIdentifier = async (take = 3) => {
	return prisma.ig_scope_identifiers.findMany({
		where: {
			affiliate_business: {
				some: {
					pipelines: {
						status: {
							equals: undefined,
						},
					},
				},
			},
		},
		include: {
			affiliate_business: true,
		},
		take,
	});
};

export const getCompletedPipelineAffiliates = async (take = 3) => {
	return prisma.ig_scope_identifiers.findMany({
		where: {
			affiliate_business: {
				some: {
					pipelines: {
						status: "completed",
					},
				},
			},
		},
		include: {
			affiliate_business: true,
			_count: {
				select: {
					affiliate_business: {
						where: {
							pipelines: {
								status: "completed",
							},
						},
					},
				},
			},
		},
		orderBy: {
			affiliate_business: {
				_count: "asc",
			},
		},
		take,
	});
};
