import { prisma } from "./prisma";
import { todayString } from "./date";

/** 同一访客在这段时间内重复打开同一篇，只算一次阅读 */
const DEDUPE_MS = 30 * 60 * 1000;

/** 记录一次阅读。返回是否计入（30 分钟内重复打开不计入） */
export async function recordView(reportId: number, visitorId: string): Promise<boolean> {
  const day = todayString();
  const key = { reportId_visitorId_day: { reportId, visitorId, day } };
  const existing = await prisma.reportView.findUnique({ where: key, select: { updatedAt: true } });

  if (!existing) {
    try {
      await prisma.reportView.create({ data: { reportId, visitorId, day } });
      return true;
    } catch {
      // 并发时另一个请求刚刚创建了这一行，按重复打开处理
      return false;
    }
  }
  if (Date.now() - existing.updatedAt.getTime() < DEDUPE_MS) return false;
  await prisma.reportView.update({ where: key, data: { count: { increment: 1 } } });
  return true;
}

export type ReportStats = { views: number; visitors: number };

/** 每篇日报的累计阅读量与访客数 */
export async function statsByReport(): Promise<Map<number, ReportStats>> {
  const rows = await prisma.reportView.groupBy({
    by: ["reportId"],
    _sum: { count: true },
    _count: { _all: true },
  });
  return new Map(rows.map((r) => [r.reportId, { views: r._sum.count ?? 0, visitors: r._count._all }]));
}

/** 将日期字符串前推 n 天 */
function daysAgo(n: number): string {
  const [y, m, d] = todayString().split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d - n));
  return date.toISOString().slice(0, 10);
}

/** 全站概览：今天、近 7 天的阅读量与访客数（访客跨文章去重） */
export async function siteOverview() {
  const today = todayString();
  const weekStart = daysAgo(6);

  const [todaySum, weekSum, todayVisitors, weekVisitors] = await Promise.all([
    prisma.reportView.aggregate({ where: { day: today }, _sum: { count: true } }),
    prisma.reportView.aggregate({ where: { day: { gte: weekStart } }, _sum: { count: true } }),
    prisma.reportView.findMany({ where: { day: today }, distinct: ["visitorId"], select: { visitorId: true } }),
    prisma.reportView.findMany({ where: { day: { gte: weekStart } }, distinct: ["visitorId"], select: { visitorId: true } }),
  ]);

  return {
    today: { views: todaySum._sum.count ?? 0, visitors: todayVisitors.length },
    week: { views: weekSum._sum.count ?? 0, visitors: weekVisitors.length },
  };
}
