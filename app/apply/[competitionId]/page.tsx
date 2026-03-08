import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ApplyForm from "./ApplyForm";

export const dynamic = "force-dynamic";

export default async function ApplyPage({ params }: { params: Promise<{ competitionId: string }> }) {
  const { competitionId } = await params;
  const session = await getSession();

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId, status: "open" },
  });
  if (!competition) notFound();

  if (!session) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">{competition.name} - 참가 신청</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="mb-2 text-lg font-medium text-amber-800">참가 신청을 하려면 로그인이 필요합니다.</p>
          <p className="mb-6 text-sm text-gray-600">로그인 후 참가 신청을 진행해 주세요.</p>
          <Link
            href={`/login?redirect=${encodeURIComponent(`/apply/${competitionId}`)}`}
            className="inline-block rounded bg-amber-600 px-6 py-3 font-medium text-white hover:bg-amber-700"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

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
