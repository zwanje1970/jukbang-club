"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

type NavItem = { href: string; label: string };

export default function AdminDashboardNav({
  nav,
  logoutHref,
}: {
  nav: NavItem[];
  logoutHref: string;
}) {
  const pathname = usePathname() ?? "";

  function isActive(href: string): boolean {
    if (href === "/admin") return pathname === "/admin" || pathname === "/admin/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="flex flex-wrap items-center gap-y-1 gap-x-0 text-sm">
      {nav.map(({ href, label }, index) => (
        <Fragment key={href}>
          {index > 0 && <span className="select-none px-1 text-white/50">|</span>}
          <Link
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={`transition hover:text-amber-400 ${isActive(href) ? "font-bold text-amber-400" : "text-white"}`}
          >
            {label}
          </Link>
        </Fragment>
      ))}
      <span className="select-none px-1 text-white/50">|</span>
      <a href={logoutHref} className="text-white transition hover:text-amber-400">
        로그아웃
      </a>
    </nav>
  );
}
