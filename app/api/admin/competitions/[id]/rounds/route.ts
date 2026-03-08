import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ROUND_VALUES = ["PRELIMINARY", "SEMI", "FINAL"] as const;
type RoundValue = (typeof ROUND_VALUES)[number];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  const { id: competitionId } = await params;
  if (!competitionId) {
    return NextResponse.json({ error: "competitionId 필요" }, { status: 400 });
  }
  try {
    const body = await req.json();
    const { rounds } = body as { rounds: Record<string, string> };
    if (!rounds || typeof rounds !== "object") {
      return NextResponse.json({ error: "rounds 객체 필요" }, { status: 400 });
    }

    const allApplications = await prisma.application.findMany({
      where: { competitionId },
      include: { user: { select: { name: true } } },
    });
    const applications = allApplications.filter(
      (a) => (a as { rejectedAt?: Date | null }).rejectedAt == null
    );

    const updates = applications
      .filter((app) => app.user?.name != null && rounds[app.user.name] !== undefined)
      .map((app) => {
        const round = rounds[app.user!.name];
        const value: RoundValue | null = ROUND_VALUES.includes(round as RoundValue)
          ? (round as RoundValue)
          : null;
        return prisma.application.update({
          where: { id: app.id },
          data: { round: value },
        });
      });

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("rounds API error:", e);
    return NextResponse.json({ error: "진출 라운드 반영 실패" }, { status: 500 });
  }
}
