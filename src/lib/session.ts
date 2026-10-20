import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

/** 在 Server Component / Route Handler 中判断是否已登录 */
export async function isAuthenticated(): Promise<boolean> {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
}

/** Route Handler 里的二次校验：未登录返回 401 响应，已登录返回 null */
export async function requireAuth(): Promise<NextResponse | null> {
  if (await isAuthenticated()) return null;
  return NextResponse.json({ error: "未登录或登录已过期" }, { status: 401 });
}
