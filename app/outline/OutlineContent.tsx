"use client";

import { useState, useEffect } from "react";

export default function OutlineContent() {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/outline", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setHtml(typeof data.html === "string" ? data.html : "");
      })
      .catch(() => setHtml(""))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-500">
        불러오는 중...
      </p>
    );
  }

  if (!html || !html.trim()) {
    return (
      <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-500">
        등록된 대회요강이 없습니다.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
      <div
        className="prose prose-sm max-w-none text-gray-700"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
