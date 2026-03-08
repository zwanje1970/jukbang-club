"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { competitionId: string; status: string };

export default function CompetitionCloseButton({ competitionId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isClosed = status === "closed";

  async function handleClick() {
    if (loading) return;
    if (isClosed && !confirm("대회를 재개하시겠습니까? 대진표 수정이 가능해집니다.")) return;
    if (!isClosed && !confirm("대회를 종료하시겠습니까? 종료 후에는 대진표를 수정할 수 없습니다.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/competitions/${competitionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: isClosed ? "open" : "closed" }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={
        isClosed
          ? "rounded border border-gray-400 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          : "rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      }
    >
      {loading ? "처리 중…" : isClosed ? "대회 재개" : "대회종료"}
    </button>
  );
}
