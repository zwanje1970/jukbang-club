"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Table = {
  id: string;
  tableNumber: number;
  youtubeUrl: string | null;
  status: string;
  isActive: boolean;
};

export default function BroadcastForm({ table }: { table: Table }) {
  const router = useRouter();
  const [youtubeUrl, setYoutubeUrl] = useState(table.youtubeUrl ?? "");
  const [status, setStatus] = useState(table.status);
  const [isActive, setIsActive] = useState(table.isActive);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/admin/broadcast", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: table.id,
          youtubeUrl: youtubeUrl || null,
          status,
          isActive,
        }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="font-semibold text-gray-800">TABLE {table.tableNumber}</h3>
      <div className="mt-3 space-y-2">
        <div>
          <label className="block text-xs text-gray-600">유튜브 URL</label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600">상태</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm">
            <option value="WAITING">방송대기중</option>
            <option value="LIVE">방송중</option>
            <option value="ENDED">종료</option>
          </select>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
          <span className="text-sm">ON (홈에 표시)</span>
        </label>
      </div>
      <button type="submit" disabled={loading} className="mt-4 w-full rounded bg-amber-600 px-3 py-2 text-sm text-white hover:bg-amber-700 disabled:opacity-50">
        저장
      </button>
    </form>
  );
}
