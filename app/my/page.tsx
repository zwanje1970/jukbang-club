import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROUND_LABELS } from "@/types";
import { formatDateKR, formatDateTimeKR } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [applications, boardPosts] = await Promise.all([
    prisma.application.findMany({
      where: { userId: session.id },
      include: { competition: { select: { name: true, date: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.boardPost.findMany({
      where: { userId: session.id },
      include: { board: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/my/edit"
        className="fixed top-20 right-4 z-40 rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-amber-700 md:right-8"
      >
        회원정보 수정
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">마이페이지</h1>
      <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-wrap gap-6">
          <p className="text-gray-800">{session.name}</p>
          <p className="text-gray-800">{session.username}</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">참가대회(경기이력)</h2>
        {applications.length === 0 ? (
          <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-gray-500">참가한 대회가 없습니다.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">대회명</th>
                  <th className="px-4 py-3 font-medium text-gray-700">일정</th>
                  <th className="px-4 py-3 font-medium text-gray-700">성적</th>
                  <th className="px-4 py-3 font-medium text-gray-700">상금</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-gray-800">{a.competition.name}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDateKR(a.competition.date)}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {a.round ? (ROUND_LABELS[a.round] ?? a.round) : "경기예정"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {a.prize != null ? `${a.prize.toLocaleString()}원` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">게시판 문의</h2>
        {boardPosts.length === 0 ? (
          <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-gray-500">문의한 글이 없습니다.</p>
        ) : (
          <ul className="space-y-2 rounded-lg border border-gray-200 bg-white">
            {boardPosts.map((p) => (
              <li key={p.id} className="border-b border-gray-100 last:border-0">
                <Link
                  href={`/my/inquiry/${p.id}`}
                  className="block px-4 py-3 text-gray-800 hover:bg-gray-50"
                >
                  <span className="font-medium">{p.title}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    {p.board.name} · {formatDateTimeKR(p.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
