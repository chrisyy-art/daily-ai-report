"use client";

import { useEffect, useRef, useState } from "react";

/** 方格边长，需与 globals.css 中 .reader-banner 的网格线间距一致 */
export const BANNER_CELL = 44;

/** 光标周围点亮的范围：距离越近越亮 */
const RADIUS = 2.6;
/** 每帧热度衰减，形成跟随拖尾 */
const DECAY = 0.9;

type Cell = { c: number; r: number };

/**
 * 横幅背景的动态方格：鼠标移到哪里，哪里的方格亮起主色并逐渐淡出；
 * 鼠标不在横幅上时，在右侧停留一小簇亮格。挂在横幅元素内部，监听其父元素的指针事件。
 */
export default function BannerGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const heat = useRef(new Map<string, number>());
  const pointer = useRef<Cell | null>(null);
  const idle = useRef<Cell | null>(null);
  const [cells, setCells] = useState<[string, number][]>([]);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;

    const place = () => {
      const cols = Math.ceil(el.clientWidth / BANNER_CELL);
      idle.current = { c: Math.round(cols * 0.74), r: 2 };
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);

    const onMove = (e: PointerEvent) => {
      const box = el.getBoundingClientRect();
      pointer.current = {
        c: Math.floor((e.clientX - box.left) / BANNER_CELL),
        r: Math.floor((e.clientY - box.top) / BANNER_CELL),
      };
    };
    const onLeave = () => (pointer.current = null);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    // 给目标格子周围加热（只增不减，交给衰减处理淡出）
    const warm = (center: Cell, strength: number) => {
      const span = Math.floor(RADIUS);
      for (let dc = -span; dc <= span; dc++) {
        for (let dr = -span; dr <= span; dr++) {
          const v = (1 - Math.hypot(dc, dr) / RADIUS) * strength;
          if (v <= 0) continue;
          const key = `${center.c + dc},${center.r + dr}`;
          heat.current.set(key, Math.max(heat.current.get(key) ?? 0, v));
        }
      }
    };

    // 系统开启「减少动态效果」时只显示静态的一簇
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (idle.current) warm(idle.current, 0.8);
      setCells([...heat.current]);
      return () => {
        ro.disconnect();
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
      };
    }

    let frame = 0;
    const tick = () => {
      const m = heat.current;
      m.forEach((v, k) => (v * DECAY < 0.02 ? m.delete(k) : m.set(k, v * DECAY)));
      const target = pointer.current ?? idle.current;
      if (target) warm(target, pointer.current ? 1 : 0.8);
      setCells([...m]);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {cells.map(([key, v]) => {
        const [c, r] = key.split(",").map(Number);
        return (
          <span
            key={key}
            className="absolute"
            style={{
              left: c * BANNER_CELL,
              top: r * BANNER_CELL,
              width: BANNER_CELL,
              height: BANNER_CELL,
              backgroundColor: `rgb(var(--primary) / ${(v * 0.2).toFixed(3)})`,
            }}
          />
        );
      })}
    </div>
  );
}
