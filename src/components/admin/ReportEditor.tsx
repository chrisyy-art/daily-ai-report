"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Markdown from "@/components/shared/Markdown";
import ReportHeader, { DailyBadge } from "@/components/shared/ReportHeader";
import type { FieldErrors } from "@/lib/validation";

export type EditorValues = {
  date: string;
  title: string;
  summary: string;
  content: string;
};

type Props = {
  /** 编辑已有日报时传入 */
  id?: number;
  initial: EditorValues;
  initialPublished?: boolean;
};

// 工具栏片段：before / after 包裹选区，placeholder 为无选区时的默认文字
const SNIPPETS = [
  { label: "B", title: "加粗", before: "**", after: "**", placeholder: "加粗文字" },
  { label: "❝", title: "引用", before: "> ", after: "", placeholder: "引用内容", block: true },
  { label: "摘要框", title: "重点摘要框", before: ":::summary\n", after: "\n:::", placeholder: "这里写重点摘要", block: true },
  { label: "链接", title: "普通链接", before: "[", after: "](https://)", placeholder: "链接文字" },
  { label: "消息来源", title: "消息来源链接", before: "[消息来源](", after: ")", placeholder: "https://" },
  { label: "体验地址", title: "体验地址链接", before: "[体验地址](", after: ")", placeholder: "https://" },
] as const;

export default function ReportEditor({ id, initial, initialPublished = false }: Props) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [values, setValues] = useState<EditorValues>(initial);
  const [saved, setSaved] = useState<EditorValues>(initial);
  const [published, setPublished] = useState(initialPublished);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState<null | "draft" | "publish">(null);
  const [notice, setNotice] = useState("");
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  // 有未保存修改时，离开页面前提醒
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function set<K extends keyof EditorValues>(key: K, value: EditorValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function insertSnippet(s: (typeof SNIPPETS)[number]) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value } = el;
    const selected = value.slice(start, end) || s.placeholder;
    // 块级片段确保独占一段
    const lead = "block" in s && s.block && start > 0 && !value.slice(0, start).endsWith("\n\n")
      ? value.slice(0, start).endsWith("\n") ? "\n" : "\n\n"
      : "";
    const insert = lead + s.before + selected + s.after;
    const next = value.slice(0, start) + insert + value.slice(end);
    set("content", next);
    requestAnimationFrame(() => {
      el.focus();
      const selStart = start + lead.length + s.before.length;
      el.setSelectionRange(selStart, selStart + selected.length);
    });
  }

  async function save(publish: boolean) {
    setSaving(publish ? "publish" : "draft");
    setFormError("");
    setNotice("");
    try {
      const res = await fetch(id ? `/api/admin/reports/${id}` : "/api/admin/reports", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, published: publish }),
      });
      if (res.status === 401) {
        setFormError("登录已过期，请在新标签页重新登录后再保存（当前内容不会丢失）");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.errors ?? {});
        setFormError(data.error || "保存失败");
        return;
      }

      setSaved(values);
      setPublished(publish);
      setErrors({});
      const time = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
      setNotice(`${publish ? "已发布" : "草稿已保存"} · ${time}`);

      if (!id) {
        router.replace(`/admin/edit/${data.report.id}`);
      }
      router.refresh();
    } catch {
      setFormError("网络异常，保存失败");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100vh-7.5rem)]">
      {/* 顶部操作栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="btn-ghost !px-3 !py-1.5">
            ← 返回列表
          </Link>
          <span className={`chip ${published ? "bg-sky-soft text-ink" : "bg-surface text-muted"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${published ? "bg-success" : "bg-muted/60"}`} />
            {id ? (published ? "已发布" : "草稿") : "新建"}
          </span>
          {dirty && <span className="text-xs font-bold text-primary">有未保存修改</span>}
        </div>
        <div className="flex items-center gap-2">
          {notice && !dirty && <span className="text-xs font-bold text-success">{notice}</span>}
          <button type="button" onClick={() => save(false)} disabled={!!saving} className="btn-ghost">
            {saving === "draft" ? "保存中…" : published ? "撤回为草稿" : "存草稿"}
          </button>
          <button type="button" onClick={() => save(true)} disabled={!!saving} className="btn-primary">
            {saving === "publish" ? "发布中…" : published ? "更新发布" : "发布"}
          </button>
        </div>
      </div>

      {formError && (
        <p className="rounded-xl border-2 border-danger bg-danger/5 px-4 py-2.5 text-sm font-semibold text-danger">{formError}</p>
      )}

      {/* 移动端：编辑 / 预览切换 */}
      <div className="flex rounded-xl border-2 border-ink bg-surface p-1 lg:hidden">
        {(["edit", "preview"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={`flex-1 rounded-lg py-1.5 text-sm font-bold transition ${
              mobileTab === tab ? "bg-sky-soft text-ink" : "text-muted"
            }`}
          >
            {tab === "edit" ? "编辑" : "预览"}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        {/* 左：表单 + Markdown 编辑 */}
        <section className={`card !rounded-3xl min-h-0 flex-col p-4 md:p-5 ${mobileTab === "edit" ? "flex" : "hidden"} lg:flex`}>
          <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
            <div>
              <label htmlFor="date" className="field-label">日期</label>
              <input
                id="date"
                type="date"
                value={values.date}
                onChange={(e) => set("date", e.target.value)}
                className={`field font-semibold ${errors.date ? "!border-danger/60" : ""}`}
              />
              {errors.date && <p className="field-error">{errors.date}</p>}
            </div>
            <div>
              <label htmlFor="title" className="field-label">标题</label>
              <input
                id="title"
                value={values.title}
                onChange={(e) => set("title", e.target.value)}
                className={`field ${errors.title ? "!border-danger/60" : ""}`}
                placeholder="如：DeepSeek V4.1-Flash 更新并公开自研搜索 API / Google 开源 Harness"
              />
              {errors.title && <p className="field-error">{errors.title}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="summary" className="field-label">摘要（可选）</label>
            <input
              id="summary"
              value={values.summary}
              onChange={(e) => set("summary", e.target.value)}
              className={`field ${errors.summary ? "!border-danger/60" : ""}`}
              placeholder="用于分享描述等场景"
            />
            {errors.summary && <p className="field-error">{errors.summary}</p>}
          </div>

          <div className="mt-4 flex min-h-0 flex-1 flex-col">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="content" className="field-label !mb-0">正文 · Markdown</label>
              <div className="flex flex-wrap gap-1">
                {SNIPPETS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    title={s.title}
                    onClick={() => insertSnippet(s)}
                    className="rounded-lg border-2 border-ink/20 bg-surface px-2 py-0.5 text-xs font-bold text-ink/70 transition hover:border-ink hover:bg-sky-soft hover:text-ink"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              id="content"
              ref={textareaRef}
              value={values.content}
              onChange={(e) => set("content", e.target.value)}
              spellCheck={false}
              className={`field min-h-[420px] flex-1 resize-none font-mono !leading-7 lg:min-h-0 ${
                errors.content ? "!border-danger/60" : ""
              }`}
              placeholder={"欢迎来到每日 AI。\n\n**某某发布新模型** [消息来源](https://...)\n\n:::summary\n重点摘要……\n:::"}
            />
            {errors.content && <p className="field-error">{errors.content}</p>}
          </div>
        </section>

        {/* 右：实时预览，复用对客端渲染组件 */}
        <section
          className={`card !rounded-3xl min-h-0 overflow-y-auto ${mobileTab === "preview" ? "block" : "hidden"} lg:block`}
          aria-label="预览"
        >
          <div className="sticky top-0 z-10 border-b-2 border-dashed border-ink/15 bg-surface/95 px-5 py-2 text-[11px] font-black tracking-[0.3em] text-primary backdrop-blur">
            PREVIEW
          </div>
          <div className="border-b-[3px] border-ink px-5 py-8 md:px-8">
            <div className="mb-6 text-center">
              <DailyBadge />
            </div>
            <ReportHeader title={values.title} date={values.date} />
          </div>
          <div className="px-5 py-8 md:px-8">
            {values.content.trim() ? (
              <Markdown content={values.content} />
            ) : (
              <p className="text-center text-sm text-muted">正文预览将显示在这里</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
