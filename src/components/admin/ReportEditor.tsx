"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Markdown from "@/components/shared/Markdown";
import ReportHeader, { DailyBadge } from "@/components/shared/ReportHeader";
import { htmlToMarkdown } from "@/lib/markdown/html-to-markdown";
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

const IMPORT_ACCEPT = ".docx,.md,.markdown,.txt,.html,.htm";
const KEEP_FORMAT_KEY = "daily-ai:paste-keep-format";

/** 把多段内容作为独立段落插入：与前后文字之间补齐空行 */
function asBlock(before: string, text: string, after: string) {
  if (!text.includes("\n")) return text;
  const lead = before === "" || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
  const tail = after === "" || after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
  return lead + text + tail;
}

/** 首行是一级 / 二级标题时，拆出来作为日报标题 */
function splitLeadingTitle(md: string) {
  const m = md.match(/^#{1,2} +(.+)\n*/);
  return m ? { title: m[1].replace(/\*\*/g, "").trim(), body: md.slice(m[0].length) } : null;
}

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
  const [keepFormat, setKeepFormat] = useState(true);
  const [importing, setImporting] = useState(false);
  const [hint, setHint] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 记住"粘贴保留格式"开关（仅本浏览器）
  useEffect(() => {
    try {
      if (localStorage.getItem(KEEP_FORMAT_KEY) === "0") setKeepFormat(false);
    } catch {}
  }, []);

  function toggleKeepFormat(on: boolean) {
    setKeepFormat(on);
    try {
      localStorage.setItem(KEEP_FORMAT_KEY, on ? "1" : "0");
    } catch {}
  }

  function flash(message: string) {
    setHint(message);
    window.setTimeout(() => setHint((h) => (h === message ? "" : h)), 4000);
  }

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

  /** 在光标处插入文本；优先用 execCommand，保留浏览器的撤销（Cmd/Ctrl+Z）记录 */
  function insertAtCursor(raw: string) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value } = el;
    const text = asBlock(value.slice(0, start), raw, value.slice(end));
    el.focus();
    const ok = typeof document.execCommand === "function" && document.execCommand("insertText", false, text);
    if (!ok) {
      set("content", value.slice(0, start) + text + value.slice(end));
      requestAnimationFrame(() => el.setSelectionRange(start + text.length, start + text.length));
    }
  }

  /** 粘贴富文本（语雀 / 飞书 / Word / 网页）时转成 Markdown，保留链接、加粗、列表等格式 */
  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    if (!keepFormat) return;
    const html = e.clipboardData.getData("text/html");
    if (!html) return; // 纯文本粘贴走浏览器默认行为
    const md = htmlToMarkdown(html);
    if (!md) return;
    e.preventDefault();
    insertAtCursor(md);
    flash("已保留格式粘贴（自动转换为 Markdown）");
  }

  async function readImportFile(file: File): Promise<{ markdown: string; images?: number }> {
    const name = file.name.toLowerCase();
    if (/\.(md|markdown|txt)$/.test(name)) return { markdown: (await file.text()).trim() };
    if (/\.html?$/.test(name)) return { markdown: htmlToMarkdown(await file.text()) };
    if (name.endsWith(".docx")) {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/import", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) throw new Error("登录已过期，请在新标签页重新登录后再导入");
      if (!res.ok) throw new Error(data.error || "导入失败");
      return data;
    }
    if (name.endsWith(".doc")) throw new Error("暂不支持旧版 .doc，请在 Word 中「另存为」.docx 后再导入");
    throw new Error("暂不支持该格式，支持 .docx / .md / .txt / .html");
  }

  async function importFile(file: File) {
    setImporting(true);
    setFormError("");
    try {
      let { markdown, images = 0 } = await readImportFile(file);
      if (!markdown) throw new Error("文档里没有可导入的内容");

      // 标题为空时，用文档首行标题填充
      const lead = !values.title.trim() ? splitLeadingTitle(markdown) : null;
      if (lead) {
        set("title", lead.title);
        markdown = lead.body;
      }

      if (!values.content.trim()) {
        set("content", markdown);
      } else if (confirm("正文已有内容。\n\n「确定」：用导入的内容替换正文\n「取消」：插入到光标位置")) {
        set("content", markdown);
      } else {
        insertAtCursor(markdown);
      }
      flash(`已导入「${file.name}」${images ? `（${images} 张图片暂不支持导入，已跳过）` : ""}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "导入失败");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <label htmlFor="content" className="field-label !mb-0">正文 · Markdown</label>
                <label
                  className="flex cursor-pointer select-none items-center gap-1.5 text-xs font-semibold text-muted"
                  title="从语雀、飞书、Word、网页复制的内容，粘贴时保留链接、加粗、列表等格式。Cmd/Ctrl + Shift + V 可粘贴纯文本"
                >
                  <input
                    type="checkbox"
                    checked={keepFormat}
                    onChange={(e) => toggleKeepFormat(e.target.checked)}
                    className="h-3.5 w-3.5 accent-[rgb(var(--primary))]"
                  />
                  粘贴保留格式
                </label>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="btn-sky !rounded-lg !px-2.5 !py-1 !text-xs"
                title="支持 .docx / .md / .txt / .html"
              >
                {importing ? "导入中…" : "导入文档"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={IMPORT_ACCEPT}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importFile(file);
                }}
              />
            </div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-primary">{hint}</p>
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
              onPaste={onPaste}
              spellCheck={false}
              className={`field min-h-[420px] flex-1 resize-none font-mono !leading-7 lg:min-h-0 ${
                errors.content ? "!border-danger/60" : ""
              }`}
              placeholder={"欢迎来到每日AI。\n\n**某某发布新模型** [消息来源](https://...)\n\n:::summary\n重点摘要……\n:::"}
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
