"use client";

import { useState } from "react";
import { THEME_COOKIE, type ReaderTheme } from "@/lib/theme";

/** 顶栏右侧的浅色 / 深色切换。直接改页面根节点的 data-theme，无需刷新 */
export default function ThemeToggle({ initial }: { initial: ReaderTheme }) {
  const [theme, setTheme] = useState<ReaderTheme>(initial);
  const next: ReaderTheme = theme === "dark" ? "light" : "dark";

  function toggle() {
    setTheme(next);
    document.querySelector<HTMLElement>("[data-reader]")?.setAttribute("data-theme", next);
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={next === "dark" ? "切换到深色" : "切换到浅色"}
      title={next === "dark" ? "切换到深色" : "切换到浅色"}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-soft hover:text-ink"
    >
      {theme === "dark" ? (
        // 当前深色 → 显示太阳
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}
