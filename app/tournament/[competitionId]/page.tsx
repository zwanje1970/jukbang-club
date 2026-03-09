import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateKR } from "@/lib/date";
import JukbangTournamentSystem from "@/components/JukbangTournamentSystem";
import CompetitionCloseButton from "@/components/CompetitionCloseButton";

export const dynamic = "force-dynamic";

async function getCompetition(id: string) {
  const competition = await prisma.competition.findUnique({
    where: { id },
    include: {
      applications: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!competition) return null;
  const applications = competition.applications.filter(
    (a) => (a as { rejectedAt?: Date | null }).rejectedAt == null
  );
  return { ...competition, applications };
}

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ competitionId: string }>;
}) {
  const { competitionId } = await params;
  const competition = await getCompetition(competitionId);
  if (!competition) notFound();

  const totalApplicants = competition.applications.length;
  const applicants = competition.applications
    .filter((a) => a.attended !== false)
    .map((a) => a.user?.name)
    .filter((n): n is string => Boolean(n));
  const initialBracket =
    competition.bracketData && typeof competition.bracketData === "object" && "rounds" in competition.bracketData
      ? (competition.bracketData as { rounds: unknown[]; currentRound: number; finished: boolean })
      : undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/admin/participants/${competitionId}`}
            className="mb-2 inline-block text-sm text-amber-600 hover:underline"
          >
            ← 경기자 명단
          </Link>
          <h1 className="mb-2 flex flex-wrap items-baseline gap-2 text-2xl font-bold text-gray-800">
            {competition.name}
            <span className="text-lg font-normal text-gray-500">{formatDateKR(competition.date)}</span>
          </h1>
          <p className="text-gray-600">
            신청자 수: {totalApplicants}명 · 참가 {applicants.length}명 (불참 제외)
          </p>
        </div>
        <div className="shrink-0">
          <CompetitionCloseButton competitionId={competitionId} status={competition.status} />
        </div>
      </div>
      {applicants.length > 0 ? (
        <JukbangTournamentSystem
          applicants={applicants}
          competitionId={competitionId}
          initialBracket={initialBracket}
          isClosed={competition.status === "closed"}
        />
      ) : (
        <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-500">
          참가자가 없어 대진표를 생성할 수 없습니다.
        </p>
      )}
    </div>
  );
}
