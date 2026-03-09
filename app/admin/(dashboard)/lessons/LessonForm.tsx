"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import VenueIntroEditor, { type VenueIntroEditorRef } from "@/components/admin/VenueIntroEditor";

type Props = {
  lessonId?: string;
  initial?: {
    slug: string;
    title: string;
    imageUrl: string;
    fee: number | string;
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
    fee: initial?.fee != null ? String(initial.fee) : "",
    period: initial?.period ?? "",
    content: initial?.content ?? "",
    sortOrder: initial?.sortOrder ?? 0,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const contentEditorRef = useRef<VenueIntroEditorRef>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const { uploadFile } = await import("@/lib/actions/upload-file");
      const result = await uploadFile(file, "lesson");
      if (result.error) throw new Error(result.error);
      if (result.url) setForm((f) => ({ ...f, imageUrl: result.url! }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    setLoading(true);
    try {
      const contentHtml = contentEditorRef.current?.getValue();
      const payload = { ...form, content: contentHtml !== undefined ? contentHtml : form.content };
      const url = lessonId ? `/api/admin/lessons/${lessonId}` : "/api/admin/lessons";
      const res = await fetch(url, {
        method: lessonId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || "저장 실패");
      setSuccess(true);
      router.refresh();
      alert("저장되었습니다.");
      router.push("/admin/lessons");
    } catch (err) {
      alert(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">커리큘럼(입문반, 기초반, 중급반, 3쿠션 등)</label>
        <select value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required>
          <option value="beginner">입문반</option>
          <option value="basic">기초반</option>
          <option value="intermediate">중급반</option>
          <option value="3c">3쿠션</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">제목</label>
        <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">홍보 이미지</label>
        <p className="mt-0.5 text-xs text-gray-500">파일 업로드</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageUpload}
            disabled={imageUploading}
            className="rounded border border-gray-300 px-3 py-2 text-sm file:mr-2 file:rounded file:border-0 file:bg-amber-100 file:px-3 file:py-1 file:text-amber-800"
          />
          {imageUploading && <span className="text-sm text-gray-500">업로드 중...</span>}
        </div>
        {form.imageUrl && (
          <div className="mt-2 relative h-32 w-48 overflow-hidden rounded border border-gray-200">
            <Image src={form.imageUrl} alt="홍보 이미지" fill className="object-cover" sizes="192px" />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">수강료</label>
          <input type="text" value={form.fee} onChange={(e) => setForm((f) => ({ ...f, fee: e.target.value }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" placeholder="예: 50000, 무료, 별도 문의" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">레슨 기간</label>
          <input type="text" value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" placeholder="예: 8주" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">내용</label>
        <p className="mt-0.5 text-xs text-gray-500">굵게, 기울임, 글자 크기·색상, 표, 정렬, 이미지 첨부 가능 (당구장 안내와 동일)</p>
        <div className="mt-1">
          <VenueIntroEditor
            ref={contentEditorRef}
            value={form.content}
            onChange={(html) => setForm((f) => ({ ...f, content: html }))}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">정렬 순서</label>
        <input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={loading} className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50">{loading ? "저장중" : "저장"}</button>
        {success && <span className="text-sm text-green-600">저장되었습니다.</span>}
      </div>
    </form>
  );
}
