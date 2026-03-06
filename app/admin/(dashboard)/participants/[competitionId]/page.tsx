import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ROUND_LABELS } from "@/types";
import { formatDateKR } from "@/lib/date";
import ParticipantActions from "./ParticipantActions";

export const dynamic = "force-dynamic";

async function getCompetition(id: string) {
  return prisma.competition.findUnique({
    where: { id },
    include: {
      applications: {
        include: { user: { select: { name: true, username: true, phone: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export default async function AdminParticipantsDetailPage({ params }: { params: Promise<{ competitionId: string }> }) {
  const { competitionId } = await params;
  const c = await getCompetition(competitionId);
  if (!c) notFound();

  return (
    <div>
      <Link href="/admin/participants" className="mb-6 inline-block text-sm text-amber-600 hover:underline">← 참가자 관리 목록</Link>
      <h1 className="mb-2 text-2xl font-bold text-gray-800">{c.name}</h1>
      <p className="mb-8 text-gray-600">{formatDateKR(c.date)}</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 px-4 py-2 text-left">이름</th>
              <th className="border border-gray-200 px-4 py-2 text-left">AVG</th>
              <th className="border border-gray-200 px-4 py-2 text-left">입금</th>
              <th className="border border-gray-200 px-4 py-2 text-left">진출 라운드</th>
              <th className="border border-gray-200 px-4 py-2 text-left">상금</th>
              <th className="border border-gray-200 px-4 py-2 text-left">액션</th>
            </tr>
          </thead>
          <tbody>
            {c.applications.map((a) => (
              <tr key={a.id}>
                <td className="border border-gray-200 px-4 py-2">{a.user.name}</td>
                <td className="border border-gray-200 px-4 py-2">{a.score}</td>
                <td className="border border-gray-200 px-4 py-2">{a.paidAt ? "완료" : "대기"}</td>
                <td className="border border-gray-200 px-4 py-2">{a.round ? ROUND_LABELS[a.round] : "-"}</td>
                <td className="border border-gray-200 px-4 py-2">{a.prize != null ? `${a.prize.toLocaleString()}원` : "-"}</td>
                <td className="border border-gray-200 px-4 py-2">
                  <ParticipantActions application={a} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {c.applications.length === 0 && <p className="text-gray-500">참가 신청이 없습니다.</p>}
    </div>
  );
}
