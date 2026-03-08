import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getCompetitionMembers(sortOrder: "asc" | "desc") {
  const users = await prisma.user.findMany({
    where: { applications: { some: {} } },
    include: {
      applications: {
        include: { competition: { select: { name: true, date: true } } },
      },
    },
    orderBy: { name: sortOrder },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    phone: u.phone,
    participationCount: u.applications.length,
    competitionNames: u.applications
      .map((a) => a.competition.name)
      .sort()
      .join(", "),
  }));
}

async function getLessonMembers(sortOrder: "asc" | "desc") {
  const users = await prisma.user.findMany({
    where: { lessonApps: { some: {} } },
    include: {
      lessonApps: {
        include: { lesson: { select: { title: true, slug: true } } },
      },
    },
    orderBy: { name: sortOrder },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    phone: u.phone,
    lessonNames: u.lessonApps.map((la) => la.lesson.title).join(", "),
  }));
}

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const sortOrder = sort === "name-desc" ? "desc" : "asc";
  const [competitionMembers, lessonMembers] = await Promise.all([
    getCompetitionMembers(sortOrder),
    getLessonMembers(sortOrder),
  ]);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-800">회원관리</h1>

      {/* 대회신청회원 */}
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">대회신청회원</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700">
                  <span className="inline-flex items-center gap-1">
                    이름
                    <Link href="/admin/members?sort=name-asc" className={sortOrder === "asc" ? "text-amber-600 font-semibold" : "text-gray-400 hover:text-gray-600"}>↑</Link>
                    <Link href="/admin/members?sort=name-desc" className={sortOrder === "desc" ? "text-amber-600 font-semibold" : "text-gray-400 hover:text-gray-600"}>↓</Link>
                  </span>
                </th>
                <th className="px-4 py-3 font-medium text-gray-700">아이디</th>
                <th className="px-4 py-3 font-medium text-gray-700">이메일</th>
                <th className="px-4 py-3 font-medium text-gray-700">전화</th>
                <th className="px-4 py-3 font-medium text-gray-700">참가횟수</th>
                <th className="px-4 py-3 font-medium text-gray-700">참가대회명</th>
                <th className="px-4 py-3 font-medium text-gray-700">회원정보</th>
              </tr>
            </thead>
            <tbody>
              {competitionMembers.map((m) => (
                <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{m.name}</td>
                  <td className="px-4 py-3 text-gray-600">{m.username}</td>
                  <td className="px-4 py-3 text-gray-600">{m.email}</td>
                  <td className="px-4 py-3 text-gray-600">{m.phone}</td>
                  <td className="px-4 py-3 text-gray-800">{m.participationCount}회</td>
                  <td className="max-w-xs px-4 py-3 text-gray-600">{m.competitionNames}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/members/${m.id}`} className="text-amber-600 hover:underline">보기</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {competitionMembers.length === 0 && (
            <p className="px-4 py-8 text-center text-gray-500">대회에 신청한 회원이 없습니다.</p>
          )}
        </div>
      </section>

      {/* 레슨회원 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">레슨회원</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700">
                  <span className="inline-flex items-center gap-1">
                    이름
                    <Link href="/admin/members?sort=name-asc" className={sortOrder === "asc" ? "text-amber-600 font-semibold" : "text-gray-400 hover:text-gray-600"}>↑</Link>
                    <Link href="/admin/members?sort=name-desc" className={sortOrder === "desc" ? "text-amber-600 font-semibold" : "text-gray-400 hover:text-gray-600"}>↓</Link>
                  </span>
                </th>
                <th className="px-4 py-3 font-medium text-gray-700">아이디</th>
                <th className="px-4 py-3 font-medium text-gray-700">이메일</th>
                <th className="px-4 py-3 font-medium text-gray-700">전화</th>
                <th className="px-4 py-3 font-medium text-gray-700">신청 레슨</th>
                <th className="px-4 py-3 font-medium text-gray-700">회원정보</th>
              </tr>
            </thead>
            <tbody>
              {lessonMembers.map((m) => (
                <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{m.name}</td>
                  <td className="px-4 py-3 text-gray-600">{m.username}</td>
                  <td className="px-4 py-3 text-gray-600">{m.email}</td>
                  <td className="px-4 py-3 text-gray-600">{m.phone}</td>
                  <td className="max-w-xs px-4 py-3 text-gray-600">{m.lessonNames}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/members/${m.id}`} className="text-amber-600 hover:underline">보기</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {lessonMembers.length === 0 && (
            <p className="px-4 py-8 text-center text-gray-500">레슨에 신청한 회원이 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  );
}
