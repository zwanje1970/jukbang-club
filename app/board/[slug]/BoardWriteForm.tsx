"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BoardWriteForm({
  boardSlug,
  boardName,
  hideTitle = false,
}: {
  boardSlug: string;
  boardName: string;
  hideTitle?: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 입력하세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/boards/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ boardSlug, title: title.trim(), content: content.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "글쓰기 실패");
        return;
      }
      setTitle("");
      setContent("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      {!hideTitle && (
        <h2 className="mb-3 text-lg font-semibold text-gray-800">{boardName} 글쓰기</h2>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          maxLength={200}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용"
          rows={5}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          등록
        </button>
      </form>
    </div>
  );
}
