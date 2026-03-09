"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { COMPETITION_TYPES } from "@/types";
import { formatDateKR } from "@/lib/date";

type Props = {
  initial?: {
    name: string;
    date: string;
    type: string;
    maxParticipants: number;
    entryFee: number;
    operatingFee: number;
    imageUrl: string;
    description: string;
    status: string;
  };
  competitionId?: string;
};

export default function CompetitionForm({ initial, competitionId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    date: initial?.date ?? new Date().toISOString().slice(0, 10),
    type: initial?.type ?? "UNDER_06",
    maxParticipants: initial?.maxParticipants ?? 30,
    entryFee: initial?.entryFee ?? 70000,
    operatingFee: initial?.operatingFee ?? 10000,
    imageUrl: initial?.imageUrl ?? "",
    description: initial?.description ?? "",
    status: initial?.status ?? "open",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { uploadFile } = await import("@/lib/actions/upload-file");
      const result = await uploadFile(file, "competition");
      if (result.error) throw new Error(result.error);
      if (result.url) setForm((f) => ({ ...f, imageUrl: result.url! }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    setLoading(true);
    try {
      const url = competitionId ? `/api/admin/competitions/${competitionId}` : "/api/admin/competitions";
      const res = await fetch(url, {
        method: competitionId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("저장 실패");
      setSuccess(true);
      router.refresh();
      setTimeout(() => {
        router.push("/admin/competitions");
      }, 800);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">대회명</label>
        <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">날짜</label>
        <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
        {form.date && <p className="mt-1 text-sm text-gray-500">{formatDateKR(form.date)}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">대회 종류</label>
        <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2">
          {COMPETITION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">참가자수</label>
          <input type="number" min={1} value={form.maxParticipants} onChange={(e) => setForm((f) => ({ ...f, maxParticipants: Number(e.target.value) }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">참가비</label>
          <input type="number" min={0} value={form.entryFee} onChange={(e) => setForm((f) => ({ ...f, entryFee: Number(e.target.value) }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">운영비</label>
          <input type="number" min={0} value={form.operatingFee} onChange={(e) => setForm((f) => ({ ...f, operatingFee: Number(e.target.value) }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">대회 이미지</label>
        <div className="mt-1 flex items-center gap-4">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            disabled={uploading}
            className="rounded border border-gray-300 px-3 py-2 text-sm file:mr-2 file:rounded file:border-0 file:bg-amber-100 file:px-3 file:py-1 file:text-amber-800"
          />
          {uploading && <span className="text-sm text-gray-500">업로드 중...</span>}
        </div>
        {form.imageUrl && (
          <div className="mt-2 relative h-32 w-48 overflow-hidden rounded border border-gray-200">
            <Image src={form.imageUrl} alt="대회 이미지" fill className="object-cover" sizes="192px" />
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">시합 방식</label>
        <textarea
          rows={5}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="시합 방식에 대한 설명을 입력하세요"
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      {competitionId && (
        <div>
          <label className="block text-sm font-medium text-gray-700">상태</label>
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="mt-1 w-full rounded border border-gray-300 px-3 py-2">
            <option value="open">접수중</option>
            <option value="ended">마감</option>
          </select>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={loading} className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50">저장</button>
        {success && <span className="text-sm text-green-600">저장되었습니다.</span>}
      </div>
    </form>
  );
}
