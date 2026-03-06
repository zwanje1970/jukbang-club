import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { competitionId, depositorName, score, recordImageUrl } = body;
    if (!competitionId || !depositorName || !score) {
      return NextResponse.json({ error: "필수 항목을 입력하세요." }, { status: 400 });
    }
    const competition = await prisma.competition.findUnique({ where: { id: competitionId } });
    if (!competition || competition.status !== "open") {
      return NextResponse.json({ error: "해당 대회 신청이 불가합니다." }, { status: 400 });
    }
    const count = await prisma.application.count({ where: { competitionId } });
    if (count >= competition.maxParticipants) {
      return NextResponse.json({ error: "참가 인원이 마감되었습니다." }, { status: 400 });
    }
    await prisma.application.create({
      data: {
        userId: session.id,
        competitionId,
        depositorName,
        score,
        recordImageUrl: recordImageUrl || null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "신청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
