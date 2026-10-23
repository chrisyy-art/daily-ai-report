"use client";

import { useEffect, useState } from "react";
import { THEME_COOKIE, THEMES, type ReaderTheme } from "@/lib/theme";

const CHANGE_EVENT = "reader-theme-change";

const ICONS: Record<ReaderTheme, React.ReactNode> = {
  p: <span className="text-[11px] font-bold leading-none">P</span>,
  light: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  dark: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  ),
};

/**
 * 页面风格切换（P / 浅色 / 深色）。直接改前台根节点的 data-theme，无需刷新。
 * 页面上可能同时有两个切换器（横幅里一个、顶栏里一个），通过事件保持同步。
 */
export default function ThemeSwitch({ initial }: { initial: ReaderTheme }) {
  const [theme, setTheme] = useState<ReaderTheme>(initial);

  useEffect(() => {
    const sync = (e: Event) => setTheme((e as CustomEvent<ReaderTheme>).detail);
    window.addEventListener(CHANGE_EVENT, sync);
    return () => window.removeEventListener(CHANGE_EVENT, sync);
  }, []);

  function choose(next: ReaderTheme) {
    document.querySelector<HTMLElement>("[data-reader]")?.setAttribute("data-theme", next);
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: next }));
  }

  return (
    <div role="radiogroup" aria-label="页面风格" className="flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5">
      {THEMES.map((t) => {
        const selected = t.id === theme;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={t.title}
            title={t.title}
            onClick={() => choose(t.id)}
            className={`grid h-7 w-7 place-items-center rounded-full transition ${
              selected ? "bg-primary text-white" : "text-muted hover:bg-soft hover:text-ink"
            }`}
          >
            {ICONS[t.id]}
          </button>
        );
      })}
    </div>
  );
}
