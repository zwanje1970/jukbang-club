"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminAccountForm({ currentUsername }: { currentUsername: string }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword && newPassword !== newPasswordConfirm) {
      setError("새 비밀번호와 확인이 일치하지 않습니다.");
      return;
    }

    if (!newUsername.trim() && !newPassword) {
      setError("새 아이디 또는 새 비밀번호 중 하나 이상 입력하세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newUsername: newUsername.trim() || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "변경에 실패했습니다.");
        return;
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewUsername("");
      setNewPassword("");
      setNewPasswordConfirm("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">변경되었습니다. (아이디를 바꾸셨다면 다음 로그인부터 새 아이디로 로그인하세요.)</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700">현재 아이디</label>
        <p className="mt-1 text-gray-800">{currentUsername}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">현재 비밀번호 (필수)</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          required
          autoComplete="current-password"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">새 아이디 (변경 시에만 입력)</label>
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          placeholder="변경하지 않으면 비워두세요"
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          autoComplete="username"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">새 비밀번호 (변경 시에만 입력)</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="변경하지 않으면 비워두세요"
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          autoComplete="new-password"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">새 비밀번호 확인</label>
        <input
          type="password"
          value={newPasswordConfirm}
          onChange={(e) => setNewPasswordConfirm(e.target.value)}
          placeholder="새 비밀번호와 동일하게 입력"
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          autoComplete="new-password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-[#0d4a2c] px-4 py-2 text-white hover:bg-[#0a3d24] disabled:opacity-50"
      >
        {loading ? "처리 중…" : "변경하기"}
      </button>
    </form>
  );
}
