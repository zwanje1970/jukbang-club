import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { routes } from "@/lib/routes";
import { COMPETITION_TYPES } from "@/types";
import { formatDateKR } from "@/lib/date";

export const dynamic = "force-dynamic";

async function getCompetitions() {
  try {
    return await prisma.competition.findMany({
      where: { status: "open" },
      orderBy: { date: "asc" },
      take: 20,
      include: { applications: { select: { id: true } } },
    });
  } catch {
    return [];
  }
}

function typeLabel(type: string) {
  return COMPETITION_TYPES.find((t) => t.value === type)?.label ?? type;
}

export default async function CompetitionPage() {
  const list = await getCompetitions();
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">대회안내</h1>
      <div className="mb-8 flex flex-wrap gap-4">
        <Link
          href={routes.outline}
          className="inline-flex items-center justify-center rounded-lg border-2 border-amber-500 bg-amber-50 px-6 py-4 text-lg font-semibold text-amber-800 shadow-sm transition hover:bg-amber-100"
        >
          대회요강
        </Link>
        <Link
          href={routes.boardCompetitionInquiry}
          className="inline-flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-6 py-4 text-lg font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
        >
          시합문의
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <Link
            key={c.id}
            href={routes.competitionId(c.id)}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
          >
            {c.imageUrl && (
              <div className="relative h-40 w-full bg-gray-100">
                <img src={c.imageUrl} alt={c.name} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <h2 className="font-semibold text-gray-800">{c.name}</h2>
              <p className="mt-1 text-sm text-amber-600">{typeLabel(c.type)}</p>
              <p className="mt-1 text-sm text-gray-600">{formatDateKR(c.date)}</p>
              <p className="mt-2 text-sm font-medium text-gray-700">현재 신청 {c.applications.length}/{c.maxParticipants}명</p>
            </div>
          </Link>
        ))}
      </div>
      {list.length === 0 && (
        <p className="text-center text-gray-500">등록된 대회가 없습니다.</p>
      )}
    </div>
  );
}
