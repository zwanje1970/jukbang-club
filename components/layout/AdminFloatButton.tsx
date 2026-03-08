"use client";

import { usePathname } from "next/navigation";

export default function AdminFloatButton() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <a
      href="/admin"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-medium text-amber-400 shadow-lg transition hover:bg-gray-800 hover:text-amber-300"
      aria-label="관리자"
    >
      관리자
    </a>
  );
}
