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
