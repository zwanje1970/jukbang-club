import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { routes } from "@/lib/routes";
import AdminDashboardNav from "@/components/admin/AdminDashboardNav";

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
    { href: routes.adminCompetitions, label: "대회관리" },
    { href: routes.adminBroadcast, label: "중계설정" },
    { href: routes.adminLessons, label: "레슨관리" },
    { href: routes.adminBoards, label: "게시판관리" },
    { href: routes.adminParticipants, label: "대회운영(참가자/대진표)" },
    { href: routes.adminMembers, label: "회원관리" },
    { href: routes.adminSettings, label: "메인설정" },
  ];

  const logoutHref = `/api/auth/logout?next=${encodeURIComponent(routes.adminLogin)}`;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-[#0d4a2c] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href={routes.admin} className="font-semibold text-amber-400">
            관리자
          </Link>
          <AdminDashboardNav nav={nav} logoutHref={logoutHref} />
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </div>
  );
}
