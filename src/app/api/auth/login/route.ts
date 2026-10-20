import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE, verifyPassword } from "@/lib/auth";

function isHttps(req: Request) {
  const forwarded = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  return (forwarded ?? new URL(req.url).protocol.replace(":", "")) === "https";
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "服务端未配置 ADMIN_PASSWORD" }, { status: 500 });
  }

  if (!(await verifyPassword(password))) {
    // 简单拖慢暴力尝试
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    // 只在 HTTPS 访问时加 Secure：服务器刚部署、还在用 http://IP 访问时也能正常登录。
    // 经 Nginx 反向代理时，靠它转发的 X-Forwarded-Proto 判断原始协议。
    secure: isHttps(req),
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
