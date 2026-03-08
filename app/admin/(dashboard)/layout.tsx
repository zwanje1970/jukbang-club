import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect(routes.adminLogin);
  }

  const nav = [
    { href: routes.admin, label: "대시보드" },
    { href: routes.adminCompetitions, label: "대회 관리" },
    { href: routes.adminBroadcast, label: "중계 설정" },
    { href: routes.adminLessons, label: "레슨 관리" },
    { href: routes.adminBoards, label: "게시판 관리" },
    { href: routes.adminParticipants, label: "대회운영(참가자, 대진표)" },
    { href: routes.adminMembers, label: "회원관리" },
    { href: routes.adminSettings, label: "메인 설정" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-[#0d4a2c] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href={routes.admin} className="font-semibold text-amber-400">관리자</Link>
          <nav className="flex gap-4 text-sm">
{nav.map(({ href, label }) => (
            <Link key={label} href={href} className="hover:text-amber-400">{label}</Link>
          ))}
            <a href={`/api/auth/logout?next=${encodeURIComponent(routes.adminLogin)}`} className="hover:text-amber-400">로그아웃</a>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </div>
  );
}
