"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const REMEMBER_KEY = "jukbang_login_remember";
const AUTO_LOGIN_KEY = "jukbang_auto_login";

function loadAutoLogin(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const v = localStorage.getItem(AUTO_LOGIN_KEY);
    if (v === null) return true;
    return v === "1";
  } catch {
    return true;
  }
}

function saveAutoLogin(value: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTO_LOGIN_KEY, value ? "1" : "0");
  } catch {
    // ignore
  }
}

function loadRemembered() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(REMEMBER_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { username?: string; password?: string };
    return { username: data.username ?? "", password: data.password ?? "" };
  } catch {
    return null;
  }
}

function saveRemembered(username: string, password: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REMEMBER_KEY, JSON.stringify({ username, password }));
  } catch {
    // ignore
  }
}

function clearRemembered() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(REMEMBER_KEY);
  } catch {
    // ignore
  }
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [autoLogin, setAutoLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const signupSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setAutoLogin(loadAutoLogin());
    const saved = loadRemembered();
    if (saved && (saved.username || saved.password)) {
      setUsername(saved.username);
      setPassword(saved.password);
      setRemember(true);
    }
  }, []);

  const [signupForm, setSignupForm] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    phone: "",
    address: "",
  });
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          redirect: redirectTo || undefined,
          remember: autoLogin,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        let message = data.error || "로그인에 실패했습니다.";
        if (res.status === 503) {
          message =
            data.error ||
            "서버를 사용할 수 없습니다. (DB 연결 오류일 수 있습니다. 배포 환경에서는 Vercel 환경 변수 DATABASE_URL을 확인하세요.)";
        }
        setError(message);
        if (data.detail != null) {
          console.error("[로그인 API 오류]", data.detail, data.code ? `(code: ${data.code})` : "");
        }
        if (data.code === "DB_CONFIG" || data.code === "DB_TIMEOUT" || data.code === "DB_CONNECT") {
          if (typeof window !== "undefined") {
            window.alert(
              "데이터베이스 연결 오류입니다.\n\n" +
                (data.code === "DB_CONFIG"
                  ? "배포 환경(Vercel)에서는 프로젝트 설정 > Environment Variables에서 DATABASE_URL을 Supabase 등 실제 DB 주소(postgresql://...)로 설정해 주세요."
                  : "DB 연결이 되지 않거나 시간이 초과되었습니다. DATABASE_URL과 Supabase 연결/방화벽을 확인하세요.")
            );
          }
        }
        return;
      }
      if (typeof window !== "undefined") {
        if (remember) saveRemembered(username, password);
        else clearRemembered();
        saveAutoLogin(autoLogin);
        window.location.href = data.redirect || "/";
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSignupError("");
    setSignupSuccess(false);
    setSignupLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setSignupError(data.error || "회원가입에 실패했습니다.");
        return;
      }
      setSignupSuccess(true);
      setSignupForm({ name: "", username: "", password: "", email: "", phone: "", address: "" });
    } finally {
      setSignupLoading(false);
    }
  }

  const signupLabels: Record<string, string> = {
    name: "이름",
    username: "아이디",
    password: "비밀번호",
    email: "이메일",
    phone: "전화번호",
    address: "주소 (동까지)",
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">로그인 / 회원가입</h1>

      {/* 로그인 */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-700">로그인</h2>
        <form onSubmit={handleLoginSubmit} className="space-y-4">
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
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span>아이디/비밀번호 기억</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span>자동로그인</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
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
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                setShowSignup(true);
                setTimeout(() => signupSectionRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
              }}
              className="w-full rounded border border-amber-600 px-4 py-2 text-amber-600 hover:bg-amber-50"
            >
              회원가입
            </button>
          </div>
        </form>
      </section>

      {/* 회원가입 */}
      <section
        ref={signupSectionRef}
        className={`border-t border-gray-200 pt-10 ${showSignup ? "block" : "hidden"}`}
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-700">회원가입</h2>
        {signupSuccess && (
          <p className="mb-4 text-sm text-green-600">회원가입이 완료되었습니다. 위에서 로그인해 주세요.</p>
        )}
        <form onSubmit={handleSignupSubmit} className="space-y-4">
          {signupError && <p className="text-sm text-red-600">{signupError}</p>}
          {["name", "username", "password", "phone", "email", "address"].map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700">
                {signupLabels[key]}
                <span className="ml-1 text-red-500">(필수)</span>
              </label>
              <input
                type={key === "password" ? "password" : key === "email" ? "email" : "text"}
                placeholder={key === "address" ? "예: 서울시 강남구 역삼동" : undefined}
                value={signupForm[key as keyof typeof signupForm]}
                onChange={(e) => setSignupForm((f) => ({ ...f, [key]: e.target.value }))}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                required
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={signupLoading}
            className="w-full rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50"
          >
            회원가입
          </button>
        </form>
      </section>
    </div>
  );
}
