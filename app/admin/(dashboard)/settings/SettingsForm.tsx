"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import VenueIntroEditor, { type VenueIntroEditorRef } from "@/components/admin/VenueIntroEditor";

const KEYS = [
  "mainBannerTitle",
  "bankAccount",
  "venueIntro",
  "venueIntroMapAddress",
] as const;

const LABELS: Record<string, string> = {
  mainBannerTitle: "메인 배너 제목",
  bankAccount: "참가비 입금 계좌",
  venueIntro: "대회당구장 안내",
  venueIntroMapAddress: "지도 표시용 주소 (지번)",
};

const BANNER_RECOMMENDED = "1920 × 400 px (가로 × 세로)";

export default function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = {};
    [...KEYS, "mainBannerUrl"].forEach((k) => (o[k] = initial[k] ?? ""));
    return o;
  });
  const [loading, setLoading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const venueEditorRef = useRef<VenueIntroEditorRef>(null);

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "업로드 실패");
      setForm((f) => ({ ...f, mainBannerUrl: data.url }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setBannerUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form };
    const editorHtml = venueEditorRef.current?.getValue();
    if (editorHtml !== undefined) payload.venueIntro = editorHtml;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = [data.error, data.detail].filter(Boolean).join("\n") || "저장에 실패했습니다.";
        alert(msg);
        return;
      }
      alert("저장되었습니다.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6 rounded-lg border border-gray-200 bg-white p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">메인 배너 제목</label>
        <input
          type="text"
          value={form.mainBannerTitle ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, mainBannerTitle: e.target.value }))}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">메인 배너 이미지</label>
        <p className="mt-0.5 text-xs text-gray-500">권장 크기: {BANNER_RECOMMENDED}</p>
        <div className="mt-1 flex items-center gap-4">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleBannerChange}
            disabled={bannerUploading}
            className="rounded border border-gray-300 px-3 py-2 text-sm file:mr-2 file:rounded file:border-0 file:bg-amber-100 file:px-3 file:py-1 file:text-amber-800"
          />
          {bannerUploading && <span className="text-sm text-gray-500">업로드 중...</span>}
        </div>
        {(form.mainBannerUrl as string) && (
          <div className="mt-2 relative h-24 w-full max-w-2xl overflow-hidden rounded border border-gray-200">
            <Image src={form.mainBannerUrl as string} alt="배너 미리보기" fill className="object-cover" sizes="640px" />
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">참가비 입금 계좌</label>
        <textarea
          rows={2}
          value={form.bankAccount ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, bankAccount: e.target.value }))}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">대회당구장 안내</label>
        <p className="mt-0.5 text-xs text-gray-500">굵게, 기울임, 글자 크기·색상, 이미지 첨부 가능</p>
        <div className="mt-1">
          <VenueIntroEditor
            ref={venueEditorRef}
            value={form.venueIntro ?? ""}
            onChange={(html) => setForm((f) => ({ ...f, venueIntro: html }))}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">지도 표시용 주소 (지번)</label>
        <p className="mt-0.5 text-xs text-gray-500">주소를 입력하면 대회당구장 안내 페이지에 네이버 지도가 표시됩니다.</p>
        <input
          type="text"
          value={form.venueIntroMapAddress ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, venueIntroMapAddress: e.target.value }))}
          placeholder="예: 서울시 강남구 테헤란로 123"
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <button type="submit" disabled={loading} className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50">
        저장
      </button>
    </form>
  );
}
