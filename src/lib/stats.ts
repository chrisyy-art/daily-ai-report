import { prisma } from "./prisma";
import { todayString } from "./date";

/**
 * 记录一次阅读。同一访客对同一篇日报只记录一次，之后再打开、刷新都不再计入。
 * 返回是否计入。
 */
export async function recordView(reportId: number, visitorId: string): Promise<boolean> {
  const existing = await prisma.reportView.findFirst({ where: { reportId, visitorId }, select: { id: true } });
  if (existing) return false;
  try {
    await prisma.reportView.create({ data: { reportId, visitorId, day: todayString() } });
    return true;
  } catch {
    // 并发时另一个请求刚刚创建了这一行，按重复打开处理
    return false;
  }
}

/**
 * 每个「访客 × 日报」首次阅读的日期。
 * 旧规则下同一访客可能留有多天的记录，这里统一只取最早一天，历史数据也按新规则去重。
 */
async function firstReads() {
  const rows = await prisma.reportView.groupBy({ by: ["reportId", "visitorId"], _min: { day: true } });
  return rows.map((r) => ({ reportId: r.reportId, visitorId: r.visitorId, day: r._min.day ?? "" }));
}

export type ReportStats = { readers: number };

/** 每篇日报的累计阅读人数（每位访客只计一次） */
export async function statsByReport(): Promise<Map<number, ReportStats>> {
  const counts = new Map<number, ReportStats>();
  for (const r of await firstReads()) {
    const s = counts.get(r.reportId) ?? { readers: 0 };
    s.readers += 1;
    counts.set(r.reportId, s);
  }
  return counts;
}

/**
 * 全站概览（均已去重）：
 * - 阅读：同一访客读同一篇只算 1 次，按首次阅读的日期归属
 * - 访客：同一访客只算 1 次，按首次来访的日期归属（「今日访客」即今天新来的访客）
 */
export async function siteOverview() {
  const today = todayString();
  const reads = await firstReads();

  const firstVisit = new Map<string, string>();
  for (const r of reads) {
    const prev = firstVisit.get(r.visitorId);
    if (!prev || r.day < prev) firstVisit.set(r.visitorId, r.day);
  }
  const visitDays = [...firstVisit.values()];

  return {
    today: { views: reads.filter((r) => r.day === today).length, visitors: visitDays.filter((d) => d === today).length },
    total: { views: reads.length, visitors: visitDays.length },
  };
}
