import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ROUND_LABELS } from "@/types";
import { formatDateKR } from "@/lib/date";

export const dynamic = "force-dynamic";

async function getCompetition(id: string) {
  return prisma.competition.findUnique({
    where: { id },
    include: {
      applications: {
        include: { user: { select: { name: true, username: true } } },
        orderBy: [{ round: "asc" }, { prize: "desc" }],
      },
    },
  });
}

export default async function ResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const competition = await getCompetition(id);
  if (!competition) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/results" className="mb-6 inline-block text-sm text-amber-600 hover:underline">
        ← 대회 결과 목록
      </Link>
      <h1 className="mb-2 text-2xl font-bold text-gray-800">{competition.name}</h1>
      <p className="mb-8 text-gray-600">{formatDateKR(competition.date)}</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 px-4 py-2 text-left">이름</th>
              <th className="border border-gray-200 px-4 py-2 text-left">AVG</th>
              <th className="border border-gray-200 px-4 py-2 text-left">진출 라운드</th>
              <th className="border border-gray-200 px-4 py-2 text-left">상금</th>
            </tr>
          </thead>
          <tbody>
            {competition.applications.map((a) => (
              <tr key={a.id}>
                <td className="border border-gray-200 px-4 py-2">{a.user.name}</td>
                <td className="border border-gray-200 px-4 py-2">{a.score}</td>
                <td className="border border-gray-200 px-4 py-2">{a.round ? ROUND_LABELS[a.round] ?? a.round : "-"}</td>
                <td className="border border-gray-200 px-4 py-2">{a.prize != null ? `${a.prize.toLocaleString()}원` : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
