import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateKR } from "@/lib/date";

export const dynamic = "force-dynamic";

async function getPastCompetitions() {
  return prisma.competition.findMany({
    where: { status: { in: ["ended", "closed"] } },
    orderBy: { date: "desc" },
    take: 30,
  });
}

export default async function ResultsPage() {
  const list = await getPastCompetitions();
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-800">대회 결과</h1>
      <ul className="space-y-2">
        {list.map((c) => (
          <li key={c.id}>
            <Link
              href={`/results/${c.id}`}
              className="block rounded-lg border border-gray-200 bg-white px-4 py-3 transition hover:bg-gray-50"
            >
              <span className="font-medium text-gray-800">{c.name}</span>
              <span className="ml-2 text-sm text-gray-500">{formatDateKR(c.date)}</span>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="text-center text-gray-500">종료된 대회가 없습니다.</p>}
    </div>
  );
}
