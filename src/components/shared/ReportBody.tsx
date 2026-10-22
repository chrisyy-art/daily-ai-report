import Markdown from "./Markdown";
import SectionTabs from "./SectionTabs";
import { parseReport } from "@/lib/markdown/sections";

/**
 * 日报主体：顶部卡片（标题 + 导语），下方按板块分 Tab，每条新闻一张卡片。
 * 正文少于 2 个板块（旧日报）时，整篇放在顶部卡片里连续展示。
 *
 * 没有 "use client"：前台在服务端渲染好所有卡片，浏览器端只负责切换 Tab；
 * 后台编辑器（客户端组件）引用时则在浏览器里实时渲染，两边展示完全一致。
 */
export default function ReportBody({ header, content }: { header: React.ReactNode; content: string }) {
  const { intro, sections } = parseReport(content);
  const tabbed = sections.length >= 2;
  const lead = tabbed ? intro : content.trim();

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

      {tabbed && (
        <SectionTabs
          tabs={sections.map((s) => ({ label: s.label, count: s.items.length }))}
          panels={sections.map((s, si) =>
            s.items.length > 0 ? (
              s.items.map((item, i) => (
                <section key={`${si}-${i}`} className="card !rounded-2xl px-5 py-4 md:px-7 md:py-5">
                  <Markdown content={item} />
                </section>
              ))
            ) : (
              <p key={si} className="card !rounded-2xl px-5 py-10 text-center text-sm text-muted">
                本板块暂无内容
              </p>
            ),
          )}
        />
      )}
    </div>
  );
}
