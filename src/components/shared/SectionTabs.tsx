"use client";

import { useRef, useState } from "react";

type Tab = { label: string; count: number };

type Props = {
  tabs: Tab[];
  panels: React.ReactNode[];
  /** 吸顶时距离可视区顶部的像素 */
  stickyTop: number;
};

/** 板块 Tab（放在新闻卡片顶部，下划线样式，滚动时吸顶）：只负责切换显示，各板块内容由调用方渲染好传入 */
export default function SectionTabs({ tabs, panels, stickyTop }: Props) {
  const [active, setActive] = useState(0);
  const anchorRef = useRef<HTMLDivElement>(null);
  // 编辑时板块数量可能变少，避免越界
  const current = Math.min(active, tabs.length - 1);

  function select(index: number) {
    setActive(index);
    // Tab 已经吸顶（说明往下读过了）时，切换后回到板块开头
    const anchor = anchorRef.current;
    if (anchor && anchor.getBoundingClientRect().top < stickyTop) {
      window.scrollTo({ top: window.scrollY + anchor.getBoundingClientRect().top - stickyTop });
    }
  }

  return (
    <>
      <div ref={anchorRef} />
      <div className="sticky z-30 rounded-t-[20px] bg-surface px-5 md:rounded-t-3xl md:px-10" style={{ top: stickyTop }}>
        <div
          role="tablist"
          aria-label="新闻板块"
          className="flex justify-between gap-4 overflow-x-auto border-b border-line [scrollbar-width:none] sm:justify-start sm:gap-7 md:gap-9"
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
                className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap py-4 text-[15px] font-medium transition md:py-5 md:text-base ${
                  selected ? "text-primary" : "text-muted hover:text-ink"
                }`}
              >
                {tab.label}
                <span className={`hidden text-xs tabular-nums sm:inline ${selected ? "text-primary/70" : "text-muted/70"}`}>{tab.count}</span>
                {selected && <span aria-hidden className="absolute inset-x-0 -bottom-px h-[3px] rounded-t-full bg-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" id="section-panel" aria-labelledby={`section-tab-${current}`}>
        {panels[current]}
      </div>
    </>
  );
}
