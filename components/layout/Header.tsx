"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { routes } from "@/lib/routes";
import { REPLAY_INTRO_EVENT } from "@/components/IntroScreen";

const NAV_PUBLIC = [
  { href: routes.home, label: "HOME" },
  { href: routes.competition, label: "대회안내" },
  { href: routes.results, label: "대회결과" },
  { href: routes.lesson, label: "당구교실" },
  { href: routes.venue, label: "당구장안내" },
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

  type NavItem = { href: string; label: string; logout?: boolean; iconOnly?: boolean };
  const navRight: NavItem[] = user
    ? [
        { href: routes.my, label: "마이페이지" },
        { href: "#", label: "로그아웃", logout: true },
      ]
    : [
        { href: routes.login, label: "로그인" },
        { href: routes.signup, label: "회원가입" },
      ];
  const navAdmin: NavItem[] = isAdmin ? [{ href: routes.admin, label: "관리자", iconOnly: true }] : [];
  const nav: NavItem[] = [...NAV_PUBLIC, ...navAdmin, ...navRight];

  const AdminIcon = () => (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path className="stroke-blue-500" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L4 5v6.09a7 7 0 005 6.64 7 7 0 006 0 7 7 0 005-6.64V5l-8-3z" />
      <circle className="stroke-current" cx="12" cy="9.5" r="1.8" strokeWidth={2} />
      <path className="stroke-current" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11.2v2.5" />
    </svg>
  );

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    if (typeof window !== "undefined") window.location.href = routes.home;
  }

  /** 현재 경로가 이 메뉴에 해당하는지 (하위 경로 포함) */
  function isActiveNav(href: string): boolean {
    const p = (pathname ?? "").toLowerCase();
    const h = href.toLowerCase();
    if (h === "/") return p === "/";
    return p === h || p.startsWith(h + "/");
  }

  return (
    <header className="relative sticky top-0 z-50 bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={routes.home}
            id="logo"
            className="logo flex-shrink-0 text-amber-400 hover:text-amber-300"
            onClick={() => {
              if (!document.getElementById("intro-screen")) {
                window.dispatchEvent(new CustomEvent(REPLAY_INTRO_EVENT));
              }
            }}
          >
            <div className="logo-balls" aria-hidden>
              <div className="logo-ball yellow" />
              <div className="logo-ball red" />
              <div className="logo-ball white" />
            </div>
            <div className="logo-text">
              <span>죽</span>
              <span>방</span>
              <span>클</span>
              <span>럽</span>
            </div>
          </Link>
          {isAdmin && (
            <span className="hidden shrink-0 animate-blink text-xs text-red-500 sm:inline md:text-sm">관리자로 로그인 중입니다.</span>
          )}
          <nav className="hidden md:flex md:items-center md:gap-6">
            {nav.map(({ href, label, logout, iconOnly }) =>
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
                  aria-label={iconOnly ? label : undefined}
                  aria-current={isActiveNav(href) ? "page" : undefined}
                  className={`inline-flex items-center text-sm font-medium transition hover:text-amber-400 ${
                    isActiveNav(href) ? "text-amber-400" : "text-white"
                  }`}
                >
                  {iconOnly ? <AdminIcon /> : label}
                </Link>
              )
            )}
          </nav>
          <button
            type="button"
            className="md:hidden shrink-0 rounded p-2 text-white hover:bg-white/10"
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

        {/* 모바일: 상단에 메뉴 버튼들 가로 배치 */}
        <nav className="flex gap-2 overflow-x-auto py-2 md:hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {nav.map(({ href, label, logout, iconOnly }) =>
            logout ? (
              <button
                key="logout"
                type="button"
                onClick={handleLogout}
                className="shrink-0 rounded bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
              >
                로그아웃
              </button>
            ) : (
              <Link
                key={href}
                href={href}
                aria-label={iconOnly ? label : undefined}
                aria-current={isActiveNav(href) ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition hover:bg-white/20 ${
                  isActiveNav(href) ? "bg-amber-500/40 text-amber-300 ring-1 ring-amber-400/50" : "bg-white/10 text-white"
                }`}
                onClick={() => setOpen(false)}
              >
                {iconOnly ? <AdminIcon /> : label}
                {isActiveNav(href) && <span className="text-[10px] text-amber-300/90">현재</span>}
              </Link>
            )
          )}
        </nav>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-t border-white/20 bg-black px-4 py-3 shadow-lg md:hidden">
          {nav.map(({ href, label, logout, iconOnly }) =>
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
                aria-label={iconOnly ? label : undefined}
                aria-current={isActiveNav(href) ? "page" : undefined}
                className={`flex items-center justify-between gap-2 py-2 text-sm hover:text-amber-400 ${
                  isActiveNav(href) ? "text-amber-400 font-medium" : "text-white"
                }`}
                onClick={() => setOpen(false)}
              >
                <span className="flex items-center gap-2">
                  {iconOnly ? <AdminIcon /> : null}
                  {iconOnly ? <span className="sr-only">{label}</span> : label}
                </span>
                {isActiveNav(href) && <span className="text-xs text-amber-400/90">현재 페이지</span>}
              </Link>
            )
          )}
        </div>
      )}
    </header>
  );
}
