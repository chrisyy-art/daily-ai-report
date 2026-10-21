"use client";

import { useEffect } from "react";

/**
 * 读者真正打开页面后才上报一次阅读。
 * 放在客户端而不是服务端渲染时计数，是为了排除侧栏链接的预加载（prefetch）。
 */
export default function ViewTracker({ reportId }: { reportId: number }) {
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId }),
      keepalive: true,
    }).catch(() => {});
  }, [reportId]);

  return null;
}
