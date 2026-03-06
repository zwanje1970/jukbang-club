import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ApplyForm from "./ApplyForm";

export const dynamic = "force-dynamic";

export default async function ApplyPage({ params }: { params: Promise<{ competitionId: string }> }) {
  const { competitionId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId, status: "open" },
  });
  if (!competition) notFound();

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true, username: true, phone: true },
  });
  if (!user) redirect("/login");

  const existing = await prisma.application.findUnique({
    where: { userId_competitionId: { userId: session.id, competitionId } },
  });
  if (existing) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-gray-700">이미 참가 신청하셨습니다.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">{competition.name} - 참가 신청</h1>
      <ApplyForm competitionId={competitionId} user={user} />
    </div>
  );
}
