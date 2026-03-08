import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ROUND_LABELS } from "@/types";
import { formatDateKR, formatDateShortKR } from "@/lib/date";
import ParticipantActions from "./ParticipantActions";
import AttendanceSelect from "./AttendanceSelect";

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

function toDateOnly(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function AdminParticipantsDetailPage({ params }: { params: Promise<{ competitionId: string }> }) {
  const { competitionId } = await params;
  const c = await getCompetition(competitionId);
  if (!c) notFound();

  const accepted = c.applications.filter((a) => !a.rejectedAt);
  const total = accepted.length;
  const max = c.maxParticipants;
  const todayStr = toDateOnly(new Date());
  const todayCount = accepted.filter((a) => toDateOnly(a.createdAt) === todayStr).length;
  const unpaidCount = accepted.filter((a) => !a.paidAt).length;

  return (
    <div>
      <Link href="/admin/participants" className="mb-6 inline-block text-sm text-amber-600 hover:underline">← 대회운영(참가자, 대진표) 목록</Link>
      <h1 className="mb-2 text-2xl font-bold text-gray-800">{c.name}</h1>
      <p className="mb-4 text-gray-600">{formatDateKR(c.date)}</p>
      {c.status === "closed" && (
        <p className="mb-4 rounded bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">종료된 대회입니다. 대진표 수정이 불가합니다.</p>
      )}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <span className="font-medium text-gray-800">{total}/{max}</span>
        <span className="flex items-center gap-4">
          <Link
            href={`/tournament/${competitionId}`}
            className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            대진표
          </Link>
          <span className="flex items-center gap-4 text-sm text-gray-600">
            <span>당일신청자 수 {todayCount}</span>
            <span>입금미확인 수 {unpaidCount}</span>
          </span>
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 px-4 py-2 text-left">이름</th>
              <th className="border border-gray-200 px-4 py-2 text-left">AVG</th>
              <th className="border border-gray-200 px-4 py-2 text-left">입금</th>
              <th className="border border-gray-200 px-4 py-2 text-left">출석</th>
              <th className="border border-gray-200 px-4 py-2 text-left">진출 라운드</th>
              <th className="border border-gray-200 px-4 py-2 text-left">상금</th>
              <th className="border border-gray-200 px-4 py-2 text-left">액션</th>
            </tr>
          </thead>
          <tbody>
            {c.applications.filter((a) => a.user).map((a) => (
              <tr key={a.id} className={a.attended === false ? "bg-gray-100" : undefined}>
                <td className="border border-gray-200 px-4 py-2">{a.user!.name}</td>
                <td className="border border-gray-200 px-4 py-2">{a.score}</td>
                <td className="border border-gray-200 px-4 py-2">
                  {a.rejectedAt ? "거절" : a.paidAt ? formatDateShortKR(a.paidAt) : "대기"}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {a.rejectedAt ? (
                    "-"
                  ) : (
                    <AttendanceSelect applicationId={a.id} attended={a.attended !== false} />
                  )}
                </td>
                <td className="border border-gray-200 px-4 py-2">{a.attended === false ? "불참" : a.round ? ROUND_LABELS[a.round] : "-"}</td>
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
