import Markdown from "./Markdown";
import ReportHeader from "./ReportHeader";
import SectionTabs from "./SectionTabs";
import { assignToTabs, parseReport, splitHeadline } from "@/lib/markdown/sections";
import { SECTION_TABS } from "@/lib/site";

type Props = {
  title: string;
  date: string;
  content: string;
  /** 板块 Tab 吸顶时距离可视区顶部的距离；前台不传，按主题自动计算 */
  stickyTop?: number;
};

/** 一条新闻：能识别「【标题】（来源…）」时拆成标题行 + 来源行 + 要点，否则按原样渲染 */
function NewsItem({ item }: { item: string }) {
  const h = splitHeadline(item);
  if (!h) return <Markdown content={item} />;
  return (
    <>
      <h3 className="news-title">【{h.title}】</h3>
      {h.meta && (
        <div className="news-meta">
          <Markdown content={h.meta} />
        </div>
      )}
      {h.body && (
        <div className="news-body">
          <Markdown content={h.body} />
        </div>
      )}
    </>
  );
}

/** 新闻列表，序号从 start + 1 开始 */
function NewsList({ items, start = 0 }: { items: string[]; start?: number }) {
  return (
    <ol className="news-list divide-y divide-line px-5 md:px-8">
      {items.map((item, i) => (
        <li key={i} className="news-item grid grid-cols-[1.75rem_1fr] gap-x-3 py-5 md:grid-cols-[2.25rem_1fr] md:py-6">
          <span className="news-no pt-0.5 text-[13px] font-semibold tabular-nums text-primary">
            {String(start + i + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <NewsItem item={item} />
          </div>
        </li>
      ))}
    </ol>
  );
}

const Empty = ({ text = "本板块暂无内容" }: { text?: string }) => (
  <p className="news-empty py-20 text-center text-sm text-muted">{text}</p>
);

/**
 * 「汇总」：当天全部新闻按板块分组，序号连续；每组标题旁可跳到对应板块的 Tab。
 * 跳转按钮带 data-goto-tab，由 SectionTabs 统一处理点击（这里保持服务端渲染）。
 */
function Overview({ buckets }: { buckets: string[][] }) {
  const groups = SECTION_TABS.map((tab, i) => ({ label: tab.label, items: buckets[i], tab: i + 1 })).filter((g) => g.items.length > 0);
  if (groups.length === 0) return <Empty text="本期暂无资讯" />;

  let offset = 0;
  return (
    <div className="news-overview">
      {groups.map((g) => {
        const start = offset;
        offset += g.items.length;
        return (
          <section key={g.label} className="news-group">
            <div className="news-group-head flex items-baseline justify-between gap-3 px-5 pt-5 md:px-8 md:pt-6">
              <h3 className="news-group-title text-[15px] font-semibold text-ink">
                {g.label}
                <span className="news-group-count ml-2 text-xs font-medium text-muted">{g.items.length} 条</span>
              </h3>
              <button type="button" data-goto-tab={g.tab} className="news-group-more shrink-0 text-xs font-medium text-primary hover:underline">
                只看本板块 →
              </button>
            </div>
            <NewsList items={g.items} start={start} />
          </section>
        );
      })}
    </div>
  );
}

/**
 * 日报主体：标题区（日期、标题、导语）+ 新闻区（「汇总」+ 各板块 Tab）。
 * 正文里的 ## 板块按名称对应到固定 Tab（见 SECTION_TABS），对不上的按顺序补位，任何内容都不会丢。
 *
 * 没有 "use client"：前台在服务端渲染好所有内容，浏览器端只负责切换 Tab；
 * 后台编辑器（客户端组件）引用时则在浏览器里实时渲染，两边展示完全一致。
 */
export default function ReportBody({ title, date, content, stickyTop }: Props) {
  const parsed = parseReport(content);
  // 「本期主线：」没加粗时自动加粗，各风格都以强调色显示
  const lead = parsed.intro.replace(/^(>\s*)?(本期主线\s*[:：])/, "$1**$2**");
  const buckets = assignToTabs(parsed.sections, SECTION_TABS);
  const total = buckets.reduce((n, b) => n + b.length, 0);

  return (
    <article className="space-y-4 md:space-y-5">
      <section className="report-intro panel panel-hero px-5 py-6 md:px-8 md:py-8">
        <ReportHeader title={title} date={date} count={total} />
        {lead && (
          <div className="lead mt-5 rounded-2xl border border-primary/10 bg-gradient-to-r from-sky-soft to-sky-soft/30 px-4 py-3.5 md:mt-6 md:px-5 md:py-4">
            <Markdown content={lead} />
          </div>
        )}
      </section>

      {/* 不加 overflow-hidden，否则 Tab 无法吸顶 */}
      <section className="news-panel panel">
        <SectionTabs
          stickyTop={stickyTop}
          tabs={[
            { label: "汇总", count: total },
            ...SECTION_TABS.map((tab, i) => ({ label: tab.label, count: buckets[i].length })),
          ]}
          panels={[
            <Overview key="overview" buckets={buckets} />,
            ...buckets.map((items, i) => (items.length > 0 ? <NewsList key={i} items={items} /> : <Empty key={i} />)),
          ]}
        />
      </section>
    </article>
  );
}
