import type { Report } from "@prisma/client";
import { prisma } from "./prisma";

export type { Report };

/** 列表项需要的字段（不带正文，减少传输） */
export type ReportListEntry = Pick<
  Report,
  "id" | "title" | "date" | "summary" | "published"
>;

const listSelect = {
  id: true,
  title: true,
  date: true,
  summary: true,
  published: true,
} as const;

// —— 对客端：只读已发布 ——

export function listPublishedReports(): Promise<ReportListEntry[]> {
  return prisma.report.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
    select: listSelect,
  });
}

export function getPublishedReportByDate(date: string) {
  return prisma.report.findFirst({ where: { date, published: true } });
}

export function getLatestPublishedReport() {
  return prisma.report.findFirst({
    where: { published: true },
    orderBy: { date: "desc" },
  });
}

// —— 后台：全部数据 ——

export function listAllReports(): Promise<ReportListEntry[]> {
  return prisma.report.findMany({ orderBy: { date: "desc" }, select: listSelect });
}

export function getReportById(id: number) {
  return prisma.report.findUnique({ where: { id } });
}

export type ReportInput = {
  title: string;
  date: string;
  summary: string | null;
  content: string;
  published: boolean;
};

export function createReport(data: ReportInput) {
  return prisma.report.create({ data });
}

export function updateReport(id: number, data: Partial<ReportInput>) {
  return prisma.report.update({ where: { id }, data });
}

export function deleteReport(id: number) {
  return prisma.report.delete({ where: { id } });
}

/** 日期是否已被其他日报占用 */
export async function isDateTaken(date: string, excludeId?: number) {
  const existing = await prisma.report.findUnique({
    where: { date },
    select: { id: true },
  });
  return !!existing && existing.id !== excludeId;
}
