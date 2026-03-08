import Link from "next/link";

export default function AdminDashboardPage() {
  const links = [
    { href: "/admin/competitions", label: "대회 관리" },
    { href: "/admin/broadcast", label: "중계 설정" },
    { href: "/admin/lessons", label: "레슨 관리" },
    { href: "/admin/boards", label: "게시판 관리" },
    { href: "/admin/participants", label: "대회운영(참가자, 대진표)" },
    { href: "/admin/members", label: "회원관리" },
    { href: "/admin/settings", label: "메인 설정" },
  ];
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-800">관리자 대시보드</h1>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(({ href, label }) => (
          <li key={label}>
            <Link href={href} className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
