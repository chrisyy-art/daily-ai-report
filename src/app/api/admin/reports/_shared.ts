import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export const DATE_TAKEN = "该日期已存在日报，请换一个日期或去编辑已有的那篇";

export function badRequest(errors: Record<string, string>, status = 400) {
  return NextResponse.json({ error: Object.values(errors)[0], errors }, { status });
}

export function dateTaken() {
  return badRequest({ date: DATE_TAKEN }, 409);
}

/** 解析路由里的 id，不合法返回 null */
export function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const isUniqueViolation = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

export const isNotFound = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";

export const notFound = () => NextResponse.json({ error: "日报不存在" }, { status: 404 });
