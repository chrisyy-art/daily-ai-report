"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/** 后台列表每一行的操作：切换发布、编辑、删除 */
export default function ReportActions({
  id,
  date,
  title,
  published,
}: {
  id: number;
  date: string;
  title: string;
  published: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function request(init: RequestInit) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        ...init,
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 401) return router.replace("/admin/login");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "操作失败");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const togglePublish = () => request({ method: "PATCH", body: JSON.stringify({ published: !published }) });

  const remove = () => {
    if (confirm(`确定删除「${title}」吗？此操作不可恢复。`)) request({ method: "DELETE" });
  };

  return (
    <>
      {published && (
        <Link href={`/report/${date}`} target="_blank" className="btn-ghost hidden !px-3 !py-1 !text-xs md:inline-flex">
          查看
        </Link>
      )}
      <button
        type="button"
        onClick={togglePublish}
        disabled={busy}
        className={`!px-3 !py-1 !text-xs ${published ? "btn-ghost !text-muted" : "btn-sky"}`}
      >
        {published ? "撤回" : "发布"}
      </button>
      <Link href={`/admin/edit/${id}`} className="btn-ghost !px-3 !py-1 !text-xs">
        编辑
      </Link>
      <button type="button" onClick={remove} disabled={busy} className="btn-danger !px-3 !py-1 !text-xs">
        删除
      </button>
    </>
  );
}
