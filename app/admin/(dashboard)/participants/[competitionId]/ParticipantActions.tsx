"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type App = {
  id: string;
  paidAt: Date | null;
  rejectedAt: Date | null;
  round: string | null;
  prize: number | null;
};

export default function ParticipantActions({ application }: { application: App }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

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

  async function unconfirmPayment() {
    if (!confirm("입금확인을 되돌리시겠습니까?")) return;
    setLoading(true);
    try {
      await fetch("/api/admin/applications/unconfirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function openRejectModal() {
    setRejectionReason("");
    setShowRejectModal(true);
  }

  async function submitReject() {
    setLoading(true);
    try {
      await fetch("/api/admin/applications/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id, rejectionReason: rejectionReason.trim() || undefined }),
      });
      setShowRejectModal(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function unrejectParticipation() {
    if (!confirm("참가거절을 되돌리시겠습니까?")) return;
    setLoading(true);
    try {
      await fetch("/api/admin/applications/unreject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {application.rejectedAt ? (
        <button
          type="button"
          onClick={unrejectParticipation}
          disabled={loading}
          className="rounded border border-gray-400 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          거절 되돌리기
        </button>
      ) : (
        <>
          {!application.paidAt ? (
            <button
              type="button"
              onClick={confirmPayment}
              disabled={loading}
              className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
            >
              입금 확인
            </button>
          ) : (
            <button
              type="button"
              onClick={unconfirmPayment}
              disabled={loading}
              className="rounded border border-red-500 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              되돌리기
            </button>
          )}
          <button
            type="button"
            onClick={openRejectModal}
            disabled={loading}
            className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
          >
            참가거절
          </button>
        </>
      )}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowRejectModal(false)}>
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <p className="mb-2 text-sm font-semibold text-gray-800">참가 거절</p>
            <p className="mb-2 text-xs text-gray-500">거절 사유를 입력하면 신청인 알림에 표시됩니다.</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="거절 사유 (선택)"
              rows={3}
              className="mb-3 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowRejectModal(false)} className="rounded border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50">
                취소
              </button>
              <button type="button" onClick={submitReject} disabled={loading} className="rounded bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700 disabled:opacity-50">
                거절
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
