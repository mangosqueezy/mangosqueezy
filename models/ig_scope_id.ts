import prisma from "@/lib/prisma";

export const getAvailableIgScopeIdentifier = async (take = 3) => {
	return prisma.ig_scope_identifiers.findMany({
		where: {
			affiliate_business: {
				none: {},
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
				some: {},
			},
		},
		include: {
			affiliate_business: {
				include: {
					pipelines: true,
				},
			},
			_count: {
				select: {
					affiliate_business: {
						where: {
							pipelines: {
								status: {
									equals: "Completed",
								},
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
