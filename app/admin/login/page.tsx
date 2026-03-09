"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, admin: true }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const isDb503 = res.status === 503 && (data.code === "DB_CONFIG" || data.code === "DB_CONNECT" || data.code === "DB_TIMEOUT");
        const message = isDb503
          ? "데이터베이스에 연결할 수 없습니다.\n\nVercel 대시보드 → 프로젝트 → Settings → Environment Variables에서 DATABASE_URL을 Neon 연결 문자열(postgresql://...?sslmode=require)로 설정한 뒤 재배포하세요."
          : (data.error || "로그인에 실패했습니다.") + (data.detail ? `\n(${data.detail})` : "");
        setError(message);
        return;
      }
      if (typeof window !== "undefined") window.location.href = "/admin";
      return;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">관리자 로그인</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700">아이디</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">비밀번호</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50">
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
