import Markdown from "./Markdown";
import SectionTabs from "./SectionTabs";
import { assignToTabs, parseReport } from "@/lib/markdown/sections";
import { SECTION_TABS } from "@/lib/site";

/**
 * 日报主体：顶部卡片（标题 + 导语），下方固定 4 个板块 Tab（见 SECTION_TABS），每条新闻一张卡片。
 * 正文里的 ## 板块按名称对应到 Tab，对不上的按顺序补位，任何内容都不会丢。
 *
 * 没有 "use client"：前台在服务端渲染好所有卡片，浏览器端只负责切换 Tab；
 * 后台编辑器（客户端组件）引用时则在浏览器里实时渲染，两边展示完全一致。
 */
export default function ReportBody({ header, content }: { header: React.ReactNode; content: string }) {
  const { intro: lead, sections } = parseReport(content);
  const buckets = assignToTabs(sections, SECTION_TABS);

  return (
    <div className="space-y-4 md:space-y-5">
      <article className="card overflow-hidden">
        {header}
        {lead && (
          <div className="px-5 py-6 md:px-8 md:py-7">
            <Markdown content={lead} />
          </div>
        )}
      </article>

      <SectionTabs
        tabs={SECTION_TABS.map((label, i) => ({ label, count: buckets[i].length }))}
        panels={buckets.map((items, ti) =>
          items.length > 0 ? (
            items.map((item, i) => (
              <section key={`${ti}-${i}`} className="card !rounded-2xl px-5 py-4 md:px-7 md:py-5">
                <Markdown content={item} />
              </section>
            ))
          ) : (
            <p key={ti} className="card !rounded-2xl px-5 py-10 text-center text-sm text-muted">
              本板块暂无内容
            </p>
          ),
        )}
      />
    </div>
  );
}
