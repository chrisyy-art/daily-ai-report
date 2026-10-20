import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * 站内跳转。部署在 Nginx 之后时，req.url 是 Next 自己监听的内部地址（如 localhost:3000），
 * 直接用它会把浏览器带到 localhost。这里按 Nginx 转发的 Host / X-Forwarded-Proto
 * 还原用户实际访问的域名或 IP（Next 的中间件不接受相对地址，只能拼成完整地址）。
 */
function redirectTo(req: NextRequest, path: string) {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? req.nextUrl.protocol.replace(":", "");
  return NextResponse.redirect(new URL(path, host ? `${proto}://${host}` : req.url));
}

/** 保护所有 /admin 页面和 /api/admin 接口 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const authed = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/admin/login") {
    // 已登录就别再看登录页了
    return authed ? redirectTo(req, "/admin") : NextResponse.next();
  }

  if (authed) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "未登录或登录已过期" }, { status: 401 });
  }

  return redirectTo(req, `/admin/login?next=${encodeURIComponent(pathname + search)}`);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
