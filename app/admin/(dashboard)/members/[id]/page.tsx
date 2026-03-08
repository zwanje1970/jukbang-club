import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateKR } from "@/lib/date";

export const dynamic = "force-dynamic";

async function getMember(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      applications: {
        include: { competition: { select: { name: true, date: true, id: true } } },
      },
      lessonApps: {
        include: { lesson: { select: { title: true, slug: true, id: true } } },
      },
    },
  });
}

export default async function AdminMemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getMember(id);
  if (!user) notFound();

  return (
    <div>
      <Link href="/admin/members" className="mb-6 inline-block text-sm text-amber-600 hover:underline">← 회원 목록</Link>
      <h1 className="mb-8 text-2xl font-bold text-gray-800">회원정보</h1>

      <div className="mb-10 rounded-lg border border-gray-200 bg-white p-6">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">이름</dt>
            <dd className="mt-0.5 text-gray-800">{user.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">아이디</dt>
            <dd className="mt-0.5 text-gray-800">{user.username}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">이메일</dt>
            <dd className="mt-0.5 text-gray-800">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">전화번호</dt>
            <dd className="mt-0.5 text-gray-800">{user.phone}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">주소 (동까지)</dt>
            <dd className="mt-0.5 text-gray-800">{user.address || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">권한</dt>
            <dd className="mt-0.5 text-gray-800">{user.role === "ADMIN" ? "관리자" : "일반회원"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">가입일</dt>
            <dd className="mt-0.5 text-gray-800">{user.createdAt.toLocaleDateString("ko-KR")}</dd>
          </div>
        </dl>
      </div>

      {user.applications.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">참가 대회</h2>
          <ul className="space-y-2 rounded-lg border border-gray-200 bg-white p-4">
            {user.applications.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <Link href={`/admin/participants/${a.competition.id}`} className="text-amber-600 hover:underline">
                  {a.competition.name}
                </Link>
                <span className="text-gray-500">{formatDateKR(a.competition.date)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {user.lessonApps.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">신청 레슨</h2>
          <ul className="space-y-2 rounded-lg border border-gray-200 bg-white p-4">
            {user.lessonApps.map((la) => (
              <li key={la.id}>
                <Link href={`/admin/lessons/${la.lesson.id}`} className="text-sm text-amber-600 hover:underline">
                  {la.lesson.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
