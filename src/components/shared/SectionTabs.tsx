"use client";

import { useRef, useState } from "react";

type Tab = { label: string; count: number };

/** 板块 Tab：只负责切换显示，各板块内容由调用方渲染好传入 */
export default function SectionTabs({ tabs, panels }: { tabs: Tab[]; panels: React.ReactNode[] }) {
  const [active, setActive] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  // 编辑时板块数量可能变少，避免越界
  const current = Math.min(active, tabs.length - 1);

  function select(index: number) {
    setActive(index);
    // 已经往下滚过 Tab 时，切换后回到 Tab 位置，从新板块的第一条开始看
    const el = tabsRef.current;
    if (el && el.getBoundingClientRect().top < 0) {
      window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 16, behavior: "smooth" });
    }
  }

  return (
    <>
      <div
        ref={tabsRef}
        role="tablist"
        aria-label="新闻板块"
        className="grid gap-2 md:gap-4"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((tab, i) => {
          const selected = i === current;
          return (
            <button
              key={`${i}-${tab.label}`}
              type="button"
              role="tab"
              id={`section-tab-${i}`}
              aria-selected={selected}
              aria-controls="section-panel"
              onClick={() => select(i)}
              className={`flex min-h-[52px] items-center justify-center gap-1.5 rounded-xl px-1 text-center text-[13px] font-semibold leading-tight transition md:min-h-[64px] md:px-2 md:text-base ${
                selected
                  ? "bg-primary text-white shadow-primary-glow"
                  : "border border-line/80 bg-surface text-ink/80 hover:border-primary/30 hover:bg-sky-soft/60 hover:text-primary"
              }`}
            >
              <span className="min-w-0">{tab.label}</span>
              <span
                className={`hidden rounded-full px-1.5 text-xs tabular-nums sm:inline ${
                  selected ? "bg-white/20 text-white" : "bg-soft text-muted"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id="section-panel" aria-labelledby={`section-tab-${current}`} className="space-y-3 md:space-y-4">
        {panels[current]}
      </div>
    </>
  );
}
