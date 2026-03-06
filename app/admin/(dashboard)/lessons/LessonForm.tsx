"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  lessonId?: string;
  initial?: {
    slug: string;
    title: string;
    imageUrl: string;
    fee: number;
    period: string;
    content: string;
    sortOrder: number;
  };
};

export default function LessonForm({ lessonId, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: initial?.slug ?? "beginner",
    title: initial?.title ?? "",
    imageUrl: initial?.imageUrl ?? "",
    fee: initial?.fee ?? 0,
    period: initial?.period ?? "",
    content: initial?.content ?? "",
    sortOrder: initial?.sortOrder ?? 0,
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = lessonId ? `/api/admin/lessons/${lessonId}` : "/api/admin/lessons";
      const res = await fetch(url, {
        method: lessonId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("저장 실패");
      router.push("/admin/lessons");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">슬러그 (beginner, basic, intermediate, 3c 등)</label>
        <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">제목</label>
        <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">홍보 이미지 URL</label>
        <input type="url" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">수강료</label>
          <input type="number" min={0} value={form.fee} onChange={(e) => setForm((f) => ({ ...f, fee: Number(e.target.value) }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">레슨 기간</label>
          <input type="text" value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" placeholder="예: 8주" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">내용 (HTML)</label>
        <textarea rows={6} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">정렬 순서</label>
        <input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
      </div>
      <button type="submit" disabled={loading} className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50">저장</button>
    </form>
  );
}
