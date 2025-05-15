import { PrismaClient } from "@/prisma/app/generated/prisma/client";

declare global {
	var prismaClientSingleton: PrismaClient | undefined;
}

const prisma = globalThis.prismaClientSingleton ?? new PrismaClient();

if (process.env.NODE_ENV === "development")
	globalThis.prismaClientSingleton = prisma;

export default prisma;
