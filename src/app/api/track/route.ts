import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/session";
import { recordView } from "@/lib/stats";

const VISITOR_COOKIE = "daily_ai_vid";
const ONE_YEAR = 60 * 60 * 24 * 365;

// 搜索引擎、链接预览、监控等自动访问不计入
const BOT_UA = /bot|crawl|spider|slurp|preview|monitor|curl|wget|python|headless|lighthouse|facebookexternalhit/i;

/** 读者打开日报时由页面调用（公开接口，无需登录） */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const reportId = Number(body?.reportId);
  if (!Number.isInteger(reportId) || reportId <= 0) {
    return NextResponse.json({ error: "参数错误" }, { status: 400 });
  }

  const ua = req.headers.get("user-agent") ?? "";
  // 管理员自己浏览前台不计入
  if (!ua || BOT_UA.test(ua) || (await isAuthenticated())) {
    return NextResponse.json({ counted: false });
  }

  const report = await prisma.report.findFirst({ where: { id: reportId, published: true }, select: { id: true } });
  if (!report) return NextResponse.json({ error: "日报不存在" }, { status: 404 });

  const cookieHeader = req.headers.get("cookie") ?? "";
  const existing = cookieHeader.match(new RegExp(`(?:^|;\\s*)${VISITOR_COOKIE}=([\\w-]{16,64})`))?.[1];
  const visitorId = existing ?? crypto.randomUUID();

  const counted = await recordView(report.id, visitorId);
  const res = NextResponse.json({ counted });
  if (!existing) {
    const forwarded = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    res.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: (forwarded ?? new URL(req.url).protocol.replace(":", "")) === "https",
      path: "/",
      maxAge: ONE_YEAR,
    });
  }
  return res;
}
