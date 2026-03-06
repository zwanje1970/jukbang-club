import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CompetitionForm from "../CompetitionForm";

export const dynamic = "force-dynamic";

async function getCompetition(id: string) {
  return prisma.competition.findUnique({
    where: { id },
  });
}

export default async function AdminCompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCompetition(id);
  if (!c) notFound();

  return (
    <div>
      <Link href="/admin/competitions" className="mb-6 inline-block text-sm text-amber-600 hover:underline">← 대회 목록</Link>
      <h1 className="mb-8 text-2xl font-bold text-gray-800">{c.name}</h1>
      <CompetitionForm
        initial={{
          name: c.name,
          date: new Date(c.date).toISOString().slice(0, 10),
          type: c.type,
          maxParticipants: c.maxParticipants,
          entryFee: c.entryFee,
          operatingFee: c.operatingFee,
          imageUrl: c.imageUrl ?? "",
          description: c.description ?? "",
          status: c.status,
        }}
        competitionId={c.id}
      />
    </div>
  );
}
