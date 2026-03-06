import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateKR } from "@/lib/date";

export const dynamic = "force-dynamic";

async function getCompetitions() {
  return prisma.competition.findMany({
    orderBy: { date: "desc" },
    include: { _count: { select: { applications: true } } },
  });
}

export default async function AdminParticipantsPage() {
  const list = await getCompetitions();
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-800">참가자 관리</h1>
      <p className="mb-6 text-gray-600">대회를 선택하면 참가자 목록을 관리할 수 있습니다.</p>
      <ul className="space-y-2">
        {list.map((c) => (
          <li key={c.id}>
            <Link
              href={`/admin/participants/${c.id}`}
              className="block rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50"
            >
              <span className="font-medium">{c.name}</span>
              <span className="ml-2 text-sm text-gray-500">
                {formatDateKR(c.date)} · 신청 {c._count.applications}명
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="text-gray-500">등록된 대회가 없습니다.</p>}
    </div>
  );
}
