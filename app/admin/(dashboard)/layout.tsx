import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const nav = [
    { href: "/admin", label: "대시보드" },
    { href: "/admin/competitions", label: "대회 관리" },
    { href: "/admin/broadcast", label: "중계 설정" },
    { href: "/admin/lessons", label: "레슨 관리" },
    { href: "/admin/boards", label: "게시판 관리" },
    { href: "/admin/participants", label: "대회운영(참가자, 대진표)" },
    { href: "/admin/members", label: "회원관리" },
    { href: "/admin/settings", label: "메인 설정" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-[#0d4a2c] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-semibold text-amber-400">관리자</Link>
          <nav className="flex gap-4 text-sm">
{nav.map(({ href, label }) => (
            <Link key={label} href={href} className="hover:text-amber-400">{label}</Link>
          ))}
            <a href="/api/auth/logout?next=/admin/login" className="hover:text-amber-400">로그아웃</a>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </div>
  );
}
