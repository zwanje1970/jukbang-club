"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, Fragment } from "react";
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
  const nav: NavItem[] = [...NAV_PUBLIC, ...navRight, ...navAdmin];

  const AdminIcon = ({ mobile }: { mobile?: boolean }) => (
    <svg
      className={`shrink-0 text-blue-500 ${mobile ? "h-5 w-5" : "h-4 w-4"}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
          {isAdmin && (
            <Link
              href={routes.admin}
              aria-label="관리자"
              aria-current={isActiveNav(routes.admin) ? "page" : undefined}
              className={`md:hidden flex shrink-0 items-center gap-1 rounded p-2 text-white hover:bg-white/10 ${
                isActiveNav(routes.admin) ? "text-amber-400" : ""
              }`}
            >
              <AdminIcon mobile />
              <span className="text-sm font-medium">ADMIN</span>
            </Link>
          )}
        </div>

        {/* 모바일: 메뉴를 | 로 구분 (관리자는 상단 오른쪽에 있으므로 제외) */}
        <nav className="flex flex-wrap items-center gap-y-1 py-2 md:hidden">
          {nav.filter((item) => !item.iconOnly).map(({ href, label, logout, iconOnly }, index) => (
            <Fragment key={logout ? "logout" : href}>
              {index > 0 && <span className="select-none px-0.5 text-white/40">|</span>}
              {logout ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-white hover:text-amber-400"
                >
                  로그아웃
                </button>
              ) : (
                <Link
                  href={href}
                  aria-label={iconOnly ? label : undefined}
                  aria-current={isActiveNav(href) ? "page" : undefined}
                  className={`inline-flex min-w-0 items-center gap-0.5 text-xs transition hover:text-amber-400 ${
                    isActiveNav(href) ? "font-bold text-amber-400" : "text-white"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {iconOnly ? (
                    <>
                      <AdminIcon mobile />
                      <span className="shrink-0">{label}</span>
                    </>
                  ) : (
                    label
                  )}
                </Link>
              )}
            </Fragment>
          ))}
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
                className={`flex items-center gap-2 py-2 text-sm hover:text-amber-400 ${
                  isActiveNav(href) ? "font-bold text-amber-400" : "text-white"
                }`}
                onClick={() => setOpen(false)}
              >
                {iconOnly ? <AdminIcon mobile /> : null}
                {iconOnly ? <span className="sr-only">{label}</span> : label}
              </Link>
            )
          )}
        </div>
      )}
    </header>
  );
}
