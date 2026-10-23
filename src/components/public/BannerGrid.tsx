"use client";

import { useEffect, useRef } from "react";

/** 方格边长，需与 globals.css 中横幅网格线间距（74px）一致 */
const CELL = 74;
/** 光标影响半径（px） */
const RADIUS = 250;
/** 最亮格子的不透明度 */
const MAX = 0.16;
/** 亮度分档数：按档变化，看起来是一格一格亮起 */
const STEPS = 7;

type Cell = { el: HTMLElement; x: number; y: number; a: number };

/**
 * 横幅背景的动态方格：离光标越近的方格越亮（主色），随鼠标移动淡入淡出；鼠标离开后全部熄灭。
 * 直接操作 DOM 而不是 React 状态，避免每次鼠标移动都重新渲染。
 * 系统开启「减少动态效果」时不显示。
 */
export default function BannerGrid() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = ref.current;
    const host = box?.parentElement;
    if (!box || !host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cells: Cell[] = [];
    let mx = -9999;
    let my = -9999;
    let queued = false;

    const build = () => {
      const cols = Math.ceil(host.offsetWidth / CELL);
      const rows = Math.ceil(host.offsetHeight / CELL);
      if (cells.length === cols * rows) return;
      box.textContent = "";
      cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const el = document.createElement("i");
          el.style.left = `${c * CELL}px`;
          el.style.top = `${r * CELL}px`;
          box.appendChild(el);
          cells.push({ el, x: c * CELL + CELL / 2, y: r * CELL + CELL / 2, a: -1 });
        }
      }
    };

    const paint = () => {
      queued = false;
      for (const cell of cells) {
        const d = Math.hypot(cell.x - mx, cell.y - my);
        const t = d >= RADIUS ? 0 : (1 - d / RADIUS) ** 2;
        const a = (Math.round(t * STEPS) / STEPS) * MAX;
        if (a !== cell.a) {
          cell.a = a;
          cell.el.style.opacity = String(a);
        }
      }
    };
    const schedule = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
      schedule();
    };
    const onLeave = () => {
      mx = my = -9999;
      schedule();
    };
    const onResize = () => {
      build();
      schedule();
    };

    build();
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <div ref={ref} aria-hidden className="banner-glow pointer-events-none absolute inset-0 z-[1] overflow-hidden" />;
}
