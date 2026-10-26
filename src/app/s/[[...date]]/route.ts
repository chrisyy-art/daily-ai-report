import { SHARE_IMAGE, SITE_URL } from "@/lib/site";

/**
 * 分享专用短链：/s → 首页，/s/2026-10-19 → 当天日报。
 * 页面只有 og:image（16:9 封面），没有 title / description，钉钉据此渲染成纯大图卡片；
 * 读者点开后立即跳到真正的页面。
 */
export function GET(_req: Request, { params }: { params: { date?: string[] } }) {
  const date = params.date?.[0];
  const target = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? `/report/${date}` : "/";
  const image = new URL(SHARE_IMAGE.url, SITE_URL).toString();
  const html = `<!doctype html>
<html><head>
<meta charset="utf-8">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="${SHARE_IMAGE.width}">
<meta property="og:image:height" content="${SHARE_IMAGE.height}">
<meta http-equiv="refresh" content="0;url=${target}">
<script>location.replace(${JSON.stringify(target)})</script>
</head><body></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
