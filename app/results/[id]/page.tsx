import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ROUND_LABELS, COMPETITION_TYPES } from "@/types";
import { formatDateKR } from "@/lib/date";
import JukbangTournamentSystem from "@/components/JukbangTournamentSystem";

export const dynamic = "force-dynamic";

async function getCompetition(id: string) {
  try {
    const competition = await prisma.competition.findUnique({
      where: { id },
      include: {
        applications: {
          include: { user: { select: { name: true, username: true } } },
          orderBy: [{ round: "asc" }, { prize: "desc" }],
        },
      },
    });
    if (!competition) return null;
    const applications = competition.applications.filter(
      (a) => (a as { rejectedAt?: Date | null }).rejectedAt == null
    );
    return { ...competition, applications };
  } catch {
    return null;
  }
}

export default async function ResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const competition = await getCompetition(id);
  if (!competition) notFound();

  const bracketData =
    competition.bracketData &&
    typeof competition.bracketData === "object" &&
    "rounds" in competition.bracketData
      ? (competition.bracketData as { rounds: unknown[]; currentRound: number; finished: boolean })
      : undefined;
  const applicants = competition.applications
    .filter((a) => a.attended !== false)
    .map((a) => a.user?.name)
    .filter((n): n is string => Boolean(n));
  const totalApplicants = competition.applications.length;
  const attendedCount = competition.applications.filter((a) => a.attended !== false).length;
  const absentCount = competition.applications.filter((a) => a.attended === false).length;
  const typeLabel = COMPETITION_TYPES.find((t) => t.value === competition.type)?.label ?? competition.type;
  const roundOrder: Record<string, number> = { FINAL: 0, SEMI: 1, PRELIMINARY: 2 };
  const sortedApplications = [...competition.applications].sort((a, b) => {
    if (a.attended === false && b.attended !== false) return 1;
    if (a.attended !== false && b.attended === false) return -1;
    if (a.attended === false && b.attended === false) return 0;
    const orderA = a.round ? (roundOrder[a.round] ?? 3) : 3;
    const orderB = b.round ? (roundOrder[b.round] ?? 3) : 3;
    return orderA - orderB;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/results" className="mb-6 inline-block text-sm text-amber-600 hover:underline">
        ← 대회결과 목록
      </Link>
      <p className="mb-1 text-sm font-medium text-amber-700">{typeLabel} 대회</p>
      <h1 className="mb-2 flex flex-wrap items-baseline gap-2 text-2xl font-bold text-gray-800">
        {competition.name}
        <span className="text-lg font-normal text-gray-500">{formatDateKR(competition.date)}</span>
      </h1>
      <p className="mb-8 text-gray-600">
        신청 {totalApplicants}명 · 참가 {attendedCount}명 · 불참 {absentCount}명
      </p>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">참가자 결과</h2>
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
              {sortedApplications.map((a) => (
                <tr key={a.id} className={a.round === "FINAL" ? "bg-amber-50" : a.round === "SEMI" ? "bg-red-50" : undefined}>
                  <td className="border border-gray-200 px-4 py-2">{a.user.name}</td>
                  <td className="border border-gray-200 px-4 py-2">{a.score}</td>
                  <td className="border border-gray-200 px-4 py-2">{a.attended === false ? "불참" : a.round ? ROUND_LABELS[a.round] ?? a.round : "-"}</td>
                  <td className="border border-gray-200 px-4 py-2">{a.prize != null ? `${a.prize.toLocaleString()}원` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {bracketData && bracketData.rounds?.length > 0 && (() => {
        const round0 = bracketData.rounds[0] as { players: string[] }[] | undefined;
        const hasTableGroups = Array.isArray(round0) && round0.length > 0;
        return hasTableGroups ? (
          <section id="participant-list" className="mb-10 scroll-mt-4">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">경기자 명단 (테이블별)</h2>
            <p className="mb-4 text-sm text-gray-600">예선 조별 명단입니다. TABLE 1·2·3…은 중계 화면과 동일합니다.</p>
            <div className="flex flex-col gap-6">
              {round0.map((group, gi) => (
                <div key={gi} id={`table-${gi + 1}`} className="scroll-mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-3 font-semibold text-gray-800">
                    TABLE {gi + 1} (예선{gi + 1}조)
                  </h3>
                  <ul className="flex flex-wrap gap-x-4 gap-y-1">
                    {(group.players || []).map((name, pi) => (
                      <li key={`${gi}-${pi}-${name}`} className="text-gray-700">
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null;
      })()}

      {bracketData && bracketData.rounds?.length > 0 && applicants.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">대진표</h2>
          <JukbangTournamentSystem
            applicants={applicants}
            initialBracket={bracketData}
            isClosed
            displayOnly
          />
        </section>
      )}
    </div>
  );
}
