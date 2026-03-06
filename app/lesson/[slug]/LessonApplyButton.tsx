"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LessonApplyButton({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/lessons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      if (res.ok) {
        setDone(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) return <p className="text-amber-600 font-medium">레슨 신청이 완료되었습니다.</p>;
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded bg-amber-600 px-6 py-3 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
    >
      레슨 신청하기
    </button>
  );
}
