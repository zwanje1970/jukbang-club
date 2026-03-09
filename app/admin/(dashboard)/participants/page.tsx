import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateKR } from "@/lib/date";

export const dynamic = "force-dynamic";

function toDateOnly(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function getCompetitions() {
  return prisma.competition.findMany({
    orderBy: { date: "desc" },
    include: {
      applications: { select: { createdAt: true, paidAt: true, rejectedAt: true } },
    },
  });
}

export default async function AdminParticipantsPage() {
  const list = await getCompetitions();
  const todayStr = toDateOnly(new Date());
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-800">대회운영(참가자/대진표)</h1>
      <p className="mb-6 text-gray-600">대회를 선택하면 참가자 목록을 관리할 수 있습니다.</p>
      <ul className="space-y-2">
        {list.map((c) => {
          const accepted = c.applications.filter((a) => !a.rejectedAt);
          const total = accepted.length;
          const todayCount = accepted.filter((a) => toDateOnly(a.createdAt) === todayStr).length;
          const unpaidCount = accepted.filter((a) => !a.paidAt).length;
          return (
            <li key={c.id}>
              <Link
                href={`/admin/participants/${c.id}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50"
              >
                <span>
                  <span className="font-medium">{c.name}</span>
                  <span className="ml-2 text-sm text-gray-500">{formatDateKR(c.date)}</span>
                  <span className="ml-2 text-sm text-gray-600">{total}/{c.maxParticipants}</span>
                </span>
                <span className="flex items-center gap-4 text-sm text-gray-600">
                  <span>당일신청자 수 {todayCount}</span>
                  <span>입금미확인 수 {unpaidCount}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {list.length === 0 && <p className="text-gray-500">등록된 대회가 없습니다.</p>}
    </div>
  );
}
