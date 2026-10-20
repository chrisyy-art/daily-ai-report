import { PrismaClient } from "@prisma/client";

// 开发环境热更新会重复实例化，挂到 globalThis 上复用
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
