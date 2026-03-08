"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BoardReplyForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    setLoading(true);
    try {
      await fetch("/api/admin/boards/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, reply }),
      });
      router.refresh();
      setReply("");
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-center gap-2">
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="답변 입력"
        className="flex-1 min-w-[200px] rounded border border-gray-300 px-3 py-2 text-sm"
        rows={2}
      />
      <button type="submit" disabled={loading || !reply.trim()} className="rounded bg-amber-600 px-3 py-2 text-sm text-white hover:bg-amber-700 disabled:opacity-50">
        답변
      </button>
      {success && <span className="text-sm text-green-600">저장되었습니다.</span>}
    </form>
  );
}
