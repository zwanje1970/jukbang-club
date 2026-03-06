"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BoardReplyForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/admin/boards/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, reply }),
      });
      router.refresh();
      setReply("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="답변 입력"
        className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
        rows={2}
      />
      <button type="submit" disabled={loading || !reply.trim()} className="rounded bg-amber-600 px-3 py-2 text-sm text-white hover:bg-amber-700 disabled:opacity-50">
        답변
      </button>
    </form>
  );
}
