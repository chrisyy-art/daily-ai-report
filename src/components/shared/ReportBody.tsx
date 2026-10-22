import Markdown from "./Markdown";
import ReportHeader from "./ReportHeader";
import SectionTabs from "./SectionTabs";
import { assignToTabs, parseReport } from "@/lib/markdown/sections";
import { SECTION_TABS } from "@/lib/site";

type Props = {
  title: string;
  date: string;
  content: string;
  /** 板块 Tab 吸顶时距离可视区顶部的距离（前台要让出顶栏高度） */
  stickyTop?: number;
};

/**
 * 日报主体：标题区 + 导语，下方固定 4 个板块 Tab（见 SECTION_TABS），每条新闻之间用细线分隔。
 * 正文里的 ## 板块按名称对应到 Tab，对不上的按顺序补位，任何内容都不会丢。
 *
 * 没有 "use client"：前台在服务端渲染好所有内容，浏览器端只负责切换 Tab；
 * 后台编辑器（客户端组件）引用时则在浏览器里实时渲染，两边展示完全一致。
 */
export default function ReportBody({ title, date, content, stickyTop = 64 }: Props) {
  const { intro: lead, sections } = parseReport(content);
  const buckets = assignToTabs(sections, SECTION_TABS);
  const total = buckets.reduce((n, b) => n + b.length, 0);

  return (
    <article>
      <ReportHeader title={title} date={date} meta={total > 0 ? `共 ${total} 条资讯` : undefined} />

      {lead && (
        <div className="lead mt-8 md:mt-10">
          <Markdown content={lead} />
        </div>
      )}

      <SectionTabs
        stickyTop={stickyTop}
        tabs={SECTION_TABS.map((label, i) => ({ label, count: buckets[i].length }))}
        panels={buckets.map((items, ti) =>
          items.length > 0 ? (
            <ol key={ti} className="divide-y divide-line">
              {items.map((item, i) => (
                <li key={i} className="news-item grid grid-cols-[2rem_1fr] gap-x-3 py-7 md:grid-cols-[2.75rem_1fr] md:py-8">
                  <span className="pt-0.5 text-sm font-semibold tabular-nums text-primary md:text-[15px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <Markdown content={item} />
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p key={ti} className="py-20 text-center text-sm text-muted">本板块暂无内容</p>
          ),
        )}
      />
    </article>
  );
}
