"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TournamentFileUpload from "@/components/TournamentFileUpload";

type User = { name: string; username: string; phone: string };

export default function ApplyForm({ competitionId, user }: { competitionId: string; user: User }) {
  const router = useRouter();
  const [depositorName, setDepositorName] = useState("");
  const [score, setScore] = useState("");
  const [recordImageUrl, setRecordImageUrl] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) {
      setError("대회 참가 신청에 동의해 주세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitionId,
          depositorName,
          score,
          recordImageUrl: recordImageUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "신청에 실패했습니다.");
        return;
      }
      router.push("/competition");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700">이름</label>
        <input
          type="text"
          value={user.name}
          readOnly
          className="mt-1 w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">아이디</label>
        <input
          type="text"
          value={user.username}
          readOnly
          className="mt-1 w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">전화번호</label>
        <input
          type="text"
          value={user.phone}
          readOnly
          className="mt-1 w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">입금자명</label>
        <input type="text" value={depositorName} onChange={(e) => setDepositorName(e.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">본인 AVG</label>
        <input type="text" value={score} onChange={(e) => setScore(e.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
      </div>
      <div>
        <TournamentFileUpload
          label="경기 기록 이미지 (선택)"
          onUploadComplete={(url) => setRecordImageUrl(url)}
        />
        {recordImageUrl && (
          <div className="mt-2 relative h-24 w-32 overflow-hidden rounded border border-gray-200">
            <Image src={recordImageUrl} alt="경기 기록" fill className="object-cover" sizes="128px" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="agree" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="rounded" />
        <label htmlFor="agree" className="text-sm text-gray-700">대회참가 신청합니다.(YOUTUBE 등 방송에 동의함)</label>
      </div>
      <button type="submit" disabled={loading} className="w-full rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50">
        참가 신청하기
      </button>
    </form>
  );
}
