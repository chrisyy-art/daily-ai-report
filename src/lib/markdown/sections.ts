/**
 * 把日报正文拆成「导语 + 若干板块 + 每个板块里的新闻条目」，供前台分 Tab 展示。
 *
 * 约定（手写和导入 HTML 都遵循）：
 * - 二级标题 `## 板块名` 开始一个板块，对应一个 Tab；
 * - 第一个板块之前的内容是导语（如「本期主线」）；
 * - 板块内以「【」开头的段落（可加粗）或 `### 标题` 开始一条新闻，每条渲染为一张卡片。
 */

export type NewsSection = {
  /** 原始标题，如「一、AI模型」 */
  title: string;
  /** Tab 上显示的名称，去掉序号，如「AI模型」 */
  label: string;
  /** 每条新闻的 Markdown */
  items: string[];
};

export type ParsedReport = { intro: string; sections: NewsSection[] };

const H2 = /^##\s+(.+?)\s*#*\s*$/;
const ITEM_START = /^\s*(?:\*\*|__)?\s*【|^###\s+/;
const FENCE = /^\s*(```|~~~)/;
const CONTAINER_OPEN = /^\s*:::\s*[A-Za-z]/;
const CONTAINER_CLOSE = /^\s*:::\s*$/;

type Line = { text: string; /** 不在代码块或 ::: 容器内部 */ topLevel: boolean };

/** 「一、AI模型：」→「AI模型」 */
export function sectionLabel(title: string): string {
  const label = title
    .replace(/\*\*|__/g, "")
    .replace(/^[一二三四五六七八九十百\d]+\s*[、.．:：)）]\s*/, "")
    .replace(/^[（(][一二三四五六七八九十\d]+[)）]\s*/, "")
    .replace(/[：:]\s*$/, "")
    .trim();
  return label || title.trim();
}

/** 按新闻起始段落把板块正文切成条目 */
function splitItems(lines: Line[]): string[] {
  const items: string[][] = [];
  let current: string[] = [];
  let prevBlank = true;

  for (const { text, topLevel } of lines) {
    if (topLevel && prevBlank && ITEM_START.test(text) && current.some((l) => l.trim())) {
      items.push(current);
      current = [];
    }
    current.push(text);
    prevBlank = text.trim() === "";
  }
  items.push(current);

  return items.map((l) => l.join("\n").trim()).filter(Boolean);
}

export function parseReport(markdown: string): ParsedReport {
  const intro: Line[] = [];
  const sections: { title: string; lines: Line[] }[] = [];
  let inFence = false;
  let depth = 0;

  for (const text of markdown.split(/\r?\n/)) {
    const topLevel = !inFence && depth === 0;
    const heading = topLevel ? text.match(H2) : null;
    if (heading) {
      sections.push({ title: heading[1], lines: [] });
      continue;
    }

    if (FENCE.test(text)) inFence = !inFence;
    else if (!inFence && CONTAINER_CLOSE.test(text)) depth = Math.max(0, depth - 1);
    else if (!inFence && CONTAINER_OPEN.test(text)) depth += 1;

    (sections.at(-1)?.lines ?? intro).push({ text, topLevel });
  }

  return {
    intro: intro.map((l) => l.text).join("\n").trim(),
    sections: sections.map((s) => ({ title: s.title, label: sectionLabel(s.title), items: splitItems(s.lines) })),
  };
}
