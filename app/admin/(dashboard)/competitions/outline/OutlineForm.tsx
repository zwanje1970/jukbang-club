"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import VenueIntroEditor, { type VenueIntroEditorRef } from "@/components/admin/VenueIntroEditor";

export default function OutlineForm({ initialHtml }: { initialHtml: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editorValue, setEditorValue] = useState(initialHtml);
  const editorRef = useRef<VenueIntroEditorRef>(null);
  const latestHtmlRef = useRef(initialHtml);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    latestHtmlRef.current = editorValue;
  }, [editorValue]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetch("/api/outline", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const html = typeof data.html === "string" ? data.html : "";
        setEditorValue(html);
        latestHtmlRef.current = html;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setEditorValue(initialHtml);
  }, [initialHtml]);

  const handleEditorChange = useCallback((html: string) => {
    latestHtmlRef.current = html;
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    setLoading(true);
    try {
      const fromEditor = editorRef.current?.getValue();
      const html = (typeof fromEditor === "string" ? fromEditor : null) ?? latestHtmlRef.current ?? "";
      const res = await fetch("/api/admin/competitions/outline", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ html }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert((data as { error?: string }).error || "저장 실패");
        return;
      }
      setSuccess(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">대회요강</label>
        <p className="mt-0.5 text-xs text-gray-500">굵게, 기울임, 글자 크기·색상, 표, 정렬, 이미지 첨부 가능 (당구장 안내와 동일)</p>
        <div className="mt-1">
          <VenueIntroEditor
            ref={editorRef}
            value={editorValue}
            onChange={handleEditorChange}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={loading} className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50">
          {loading ? "저장중" : "저장"}
        </button>
        {success && (
          <span className="rounded bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
            저장되었습니다.
          </span>
        )}
      </div>
    </form>
  );
}
