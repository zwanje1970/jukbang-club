import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { COMPETITION_TYPES } from "@/types";
import { formatDateKR } from "@/lib/date";

export const dynamic = "force-dynamic";

async function getCompetition(id: string) {
  return prisma.competition.findUnique({
    where: { id },
    include: {
      // Filter rejected in memory until Prisma client is regenerated (where: { rejectedAt: null })
      applications: { select: { id: true } },
    },
  });
}

async function getBankAccount() {
  const s = await prisma.siteSetting.findUnique({ where: { key: "bankAccount" } });
  return s?.value ?? "";
}

export default async function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [competition, bankHtml] = await Promise.all([getCompetition(id), getBankAccount()]);
  if (!competition) notFound();

  const typeLabel = COMPETITION_TYPES.find((t) => t.value === competition.type)?.label ?? competition.type;
  const applicationCount = competition.applications.length;
  const expectedPrize = competition.entryFee * applicationCount - competition.operatingFee * applicationCount;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {competition.imageUrl && (
        <div className="mb-8 overflow-hidden rounded-lg">
          <img src={competition.imageUrl} alt={competition.name} className="h-64 w-full object-cover md:h-80" />
        </div>
      )}
      <h1 className="mb-4 text-2xl font-bold text-gray-800">{competition.name}</h1>
      <dl className="space-y-2 text-gray-700">
        <div>
          <dt className="font-medium">대회 종류</dt>
          <dd>{typeLabel}</dd>
        </div>
        <div>
          <dt className="font-medium">일정</dt>
          <dd>{formatDateKR(competition.date)}</dd>
        </div>
        <div>
          <dt className="font-medium">참가자 수</dt>
          <dd>{competition.maxParticipants}명 (선착순)</dd>
        </div>
        <div>
          <dt className="font-medium">현재 신청자수</dt>
          <dd>{applicationCount}/{competition.maxParticipants}명</dd>
        </div>
        <div>
          <dt className="font-medium">참가비</dt>
          <dd>{competition.entryFee.toLocaleString()}원</dd>
        </div>
        <div>
          <dt className="font-medium">예상 총상금</dt>
          <dd className="text-amber-600 font-semibold">{expectedPrize.toLocaleString()}원</dd>
          <dd className="mt-0.5 text-sm text-gray-500">(대회진행비를 공제한 금액으로 참가인원에 따라 달라집니다.)</dd>
        </div>
      </dl>
      {competition.description && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h2 className="mb-2 font-semibold">시합 방식</h2>
          <p className="whitespace-pre-wrap text-gray-700">{competition.description}</p>
        </div>
      )}
      {bankHtml && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
          <h2 className="mb-2 font-semibold text-gray-800">입금 안내</h2>
          <p className="whitespace-pre-wrap text-gray-700">{bankHtml}</p>
        </div>
      )}
      <div className="mt-8">
        {competition.status === "open" ? (
          <Link
            href={`/apply/${competition.id}`}
            className="inline-block rounded bg-amber-600 px-6 py-3 font-medium text-white hover:bg-amber-700"
          >
            참가 신청
          </Link>
        ) : (
          <p className="text-gray-600">신청이 마감되었습니다.</p>
        )}
      </div>
    </div>
  );
}
