"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";
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
        body: JSON.stringify({ username, password, redirect: redirectTo || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data.error || "로그인에 실패했습니다.";
        setError(message);
        if (data.detail != null) {
          console.error("[로그인 API 오류]", data.detail, data.code ? `(code: ${data.code})` : "");
        }
        if (data.code === "DB_CONFIG") {
          console.error("[로그인] DB 설정 오류: 배포 환경에서는 Vercel 프로젝트 설정 > Environment Variables에서 DATABASE_URL을 실제 DB 주소로 설정해야 합니다.");
          if (typeof window !== "undefined") {
            window.alert("데이터베이스 연결 설정 오류입니다.\n\n배포 환경(Vercel)에서는 프로젝트 설정 > Environment Variables에서 DATABASE_URL을 localhost가 아닌 실제 DB 호스트 주소로 설정해 주세요.");
          }
        }
        return;
      }
      // 쿠키가 적용된 상태로 새로고침되도록 전체 이동
      if (typeof window !== "undefined") window.location.href = data.redirect || "/";
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">로그인</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700">아이디</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50"
          >
            로그인
          </button>
          <Link
            href="/find-id"
            className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            아이디 찾기
          </Link>
          <Link
            href="/find-pw"
            className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            비밀번호 찾기
          </Link>
        </div>
      </form>
    </div>
  );
}
