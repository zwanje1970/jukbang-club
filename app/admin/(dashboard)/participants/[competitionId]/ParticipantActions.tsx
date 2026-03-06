"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type App = {
  id: string;
  paidAt: Date | null;
  round: string | null;
  prize: number | null;
};

export default function ParticipantActions({ application }: { application: App }) {
  const router = useRouter();
  const [round, setRound] = useState(application.round ?? "");
  const [prize, setPrize] = useState(application.prize ?? "");
  const [loading, setLoading] = useState(false);

  async function confirmPayment() {
    setLoading(true);
    try {
      await fetch("/api/admin/applications/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function updateRoundPrize(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/admin/applications/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          round: round || null,
          prize: prize ? Number(prize) : null,
        }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!application.paidAt && (
        <button
          type="button"
          onClick={confirmPayment}
          disabled={loading}
          className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
        >
          입금 확인
        </button>
      )}
      <form onSubmit={updateRoundPrize} className="flex items-center gap-1">
        <select value={round} onChange={(e) => setRound(e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-xs">
          <option value="">-</option>
          <option value="PRELIMINARY">예선</option>
          <option value="SEMI">준결</option>
          <option value="FINAL">결승</option>
        </select>
        <input
          type="number"
          placeholder="상금"
          value={prize}
          onChange={(e) => setPrize(e.target.value)}
          className="w-20 rounded border border-gray-300 px-2 py-1 text-xs"
        />
        <button type="submit" disabled={loading} className="rounded bg-amber-600 px-2 py-1 text-xs text-white hover:bg-amber-700 disabled:opacity-50">저장</button>
      </form>
    </div>
  );
}
