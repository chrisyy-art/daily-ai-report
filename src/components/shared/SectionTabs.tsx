"use client";

import { useRef, useState } from "react";

type Tab = { label: string; count: number };

type Props = {
  tabs: Tab[];
  panels: React.ReactNode[];
  /** 吸顶时距离可视区顶部的像素；不传则用前台的 --sticky-top（随主题、屏幕宽度变化） */
  stickyTop?: number;
};

/** 板块 Tab（放在新闻卡片顶部，下划线样式，滚动时吸顶）：只负责切换显示，各板块内容由调用方渲染好传入 */
export default function SectionTabs({ tabs, panels, stickyTop }: Props) {
  const [active, setActive] = useState(0);
  const anchorRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  // 编辑时板块数量可能变少，避免越界
  const current = Math.min(active, tabs.length - 1);

  function select(index: number) {
    setActive(index);
    // Tab 已经吸顶（说明往下读过了）时，切换后回到板块开头
    const anchor = anchorRef.current;
    const offset = barRef.current ? parseFloat(getComputedStyle(barRef.current).top) || 0 : 0;
    if (anchor && anchor.getBoundingClientRect().top < offset) {
      window.scrollTo({ top: window.scrollY + anchor.getBoundingClientRect().top - offset });
    }
  }

  return (
    <>
      <div ref={anchorRef} />
      <div
        ref={barRef}
        className="section-tabs-bar sticky z-30 rounded-t-[20px] bg-surface px-5 md:rounded-t-3xl md:px-8"
        style={{ top: stickyTop ?? "var(--sticky-top, 56px)" }}
      >
        {/* 手机上 Tab 放不下时可左右滑动，右侧渐隐提示还有内容 */}
        <span aria-hidden className="section-tabs-fade pointer-events-none absolute inset-y-0 right-5 z-10 w-10 bg-gradient-to-l from-surface sm:hidden" />
        <div
          role="tablist"
          aria-label="新闻板块"
          className="section-tablist flex gap-5 overflow-x-auto border-b border-line pr-8 [scrollbar-width:none] sm:gap-6 sm:pr-0 md:gap-8"
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
                className={`section-tab relative flex shrink-0 items-center gap-1.5 whitespace-nowrap py-3.5 text-sm font-medium transition md:py-4 md:text-[15px] ${
                  selected ? "text-primary" : "text-muted hover:text-ink"
                }`}
              >
                {tab.label}
                <span className={`section-tab-count hidden text-xs tabular-nums sm:inline ${selected ? "text-primary/70" : "text-muted/70"}`}>{tab.count}</span>
                {selected && <span aria-hidden className="section-tab-line absolute inset-x-0 -bottom-px h-[3px] rounded-t-full bg-gradient-to-r from-primary to-sky" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 面板内带 data-goto-tab 的按钮（如「汇总」里的「只看本板块」）可切换到对应 Tab */}
      <div
        role="tabpanel"
        id="section-panel"
        aria-labelledby={`section-tab-${current}`}
        onClick={(e) => {
          const target = (e.target as HTMLElement).closest<HTMLElement>("[data-goto-tab]");
          if (target) select(Number(target.dataset.gotoTab));
        }}
      >
        {panels[current]}
      </div>
    </>
  );
}
