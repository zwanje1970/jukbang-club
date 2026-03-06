"use client";

import { useState } from "react";
import Link from "next/link";

export default function FindPwPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/find-pw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, username, newPassword: newPassword || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "처리에 실패했습니다.");
        return;
      }
      setResult(data.message || "비밀번호가 초기화되었습니다. 로그인 후 변경하세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">비밀번호 찾기</h1>
      <p className="mb-4 text-sm text-gray-600">이름, 전화번호, 이메일, 아이디 확인 후 비밀번호를 재설정할 수 있습니다.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {result && <p className="text-sm font-medium text-amber-700">{result}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700">이름</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">전화번호</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">이메일</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">아이디</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">새 비밀번호 (선택, 비우면 임시비밀번호 발급)</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50">
          비밀번호 재설정
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        <Link href="/login" className="text-amber-600 hover:underline">로그인으로 돌아가기</Link>
      </p>
    </div>
  );
}
