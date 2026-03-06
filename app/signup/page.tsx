"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "회원가입에 실패했습니다.");
        return;
      }
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">회원가입</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {["name", "username", "password", "email", "phone"].map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700">
              {key === "name" && "이름"}
              {key === "username" && "아이디"}
              {key === "password" && "비밀번호"}
              {key === "email" && "이메일"}
              {key === "phone" && "전화번호"}
            </label>
            <input
              type={key === "password" ? "password" : key === "email" ? "email" : "text"}
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50"
        >
          회원가입
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        이미 계정이 있으신가요? <Link href="/login" className="text-amber-600 hover:underline">로그인</Link>
      </p>
    </div>
  );
}
