"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_PUBLIC = [
  { href: "/", label: "HOME" },
  { href: "/competition", label: "대회안내" },
  { href: "/results", label: "대회결과" },
  { href: "/lesson", label: "당구교실" },
  { href: "/venue", label: "대회당구장 안내" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ username: string; role?: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUser(d?.user ?? null))
      .catch(() => setUser(null));
  }, []);
  const isAdmin = user?.role === "ADMIN";

  type NavItem = { href: string; label: string; logout?: boolean };
  const navRight: NavItem[] = user
    ? [
        { href: "/my", label: "마이페이지" },
        { href: "#", label: "로그아웃", logout: true },
      ]
    : [
        { href: "/login", label: "로그인" },
        { href: "/signup", label: "회원가입" },
      ];
  const nav: NavItem[] = [...NAV_PUBLIC, ...navRight];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 bg-black text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-lg font-semibold text-amber-400 hover:text-amber-300">
            <span className="h-4 w-4 shrink-0 rounded-full bg-yellow-400" aria-hidden />
            <span className="h-4 w-4 shrink-0 rounded-full bg-red-500" aria-hidden />
            <span className="h-4 w-4 shrink-0 rounded-full bg-white" aria-hidden />
            죽방클럽
          </Link>
          {isAdmin && (
            <span className="animate-blink text-xs text-red-500 md:text-sm">관리자로 로그인 중입니다.</span>
          )}
        </div>

        <nav className="hidden md:flex md:items-center md:gap-6">
          {nav.map(({ href, label, logout }) =>
            logout ? (
              <button
                key="logout"
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-white transition hover:text-amber-400"
              >
                로그아웃
              </button>
            ) : (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition hover:text-amber-400 ${
                  pathname === href ? "text-amber-400" : "text-white"
                }`}
              >
                {label}
              </Link>
            )
          )}
        </nav>

        <button
          type="button"
          className="md:hidden rounded p-2 text-white hover:bg-white/10"
          onClick={() => setOpen((o) => !o)}
          aria-label="메뉴"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-white/20 bg-black px-4 py-3 md:hidden">
          {nav.map(({ href, label, logout }) =>
            logout ? (
              <button
                key="logout"
                type="button"
                onClick={() => { setOpen(false); handleLogout(); }}
                className="block w-full py-2 text-left text-sm text-white hover:text-amber-400"
              >
                로그아웃
              </button>
            ) : (
              <Link
                key={href}
                href={href}
                className="block py-2 text-sm text-white hover:text-amber-400"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            )
          )}
        </div>
      )}
    </header>
  );
}
