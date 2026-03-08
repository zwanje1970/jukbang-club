import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { COMPETITION_TYPES } from "@/types";
import { formatDateKR } from "@/lib/date";

export const dynamic = "force-dynamic";

async function getCompetitions() {
  // Note: include rejected in count until Prisma client has rejectedAt (run: npx prisma generate)
  return prisma.competition.findMany({
    orderBy: { date: "desc" },
    include: { applications: { select: { id: true } } },
  });
}

export default async function AdminCompetitionsPage() {
  const list = await getCompetitions();
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">대회 관리</h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/competitions/outline" className="rounded border border-amber-600 px-4 py-2 text-amber-600 hover:bg-amber-50">대회요강 편집</Link>
          <Link href="/admin/competitions/new" className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700">대회 생성</Link>
        </div>
      </div>
      <ul className="space-y-2">
        {list.map((c) => (
          <li key={c.id}>
            <Link
              href={`/admin/competitions/${c.id}`}
              className="block rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50"
            >
              <span className="font-medium">{c.name}</span>
              <span className="ml-2 text-sm text-gray-500">
                {formatDateKR(c.date)} · {COMPETITION_TYPES.find((t) => t.value === c.type)?.label ?? c.type} · 신청 {c.applications.length}/{c.maxParticipants}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
