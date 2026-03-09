import { prisma } from "@/lib/prisma";
import BroadcastForm from "./BroadcastForm";

export const dynamic = "force-dynamic";

async function getTables() {
  return prisma.broadcastTable.findMany({
    orderBy: { tableNumber: "asc" },
  });
}

export default async function AdminBroadcastPage() {
  const tables = await getTables();
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-800">중계설정</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((t) => (
          <BroadcastForm key={t.id} table={t} />
        ))}
      </div>
    </div>
  );
}
