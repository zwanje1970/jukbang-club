import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type BracketPayload = {
  rounds: unknown[];
  currentRound: number;
  finished: boolean;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: competitionId } = await params;
  if (!competitionId) {
    return NextResponse.json({ error: "competitionId 필요" }, { status: 400 });
  }
  try {
    const c = await prisma.competition.findUnique({
      where: { id: competitionId },
      select: { bracketData: true },
    });
    if (!c) return NextResponse.json({ error: "대회 없음" }, { status: 404 });
    return NextResponse.json(c.bracketData ?? null);
  } catch (e) {
    console.error("bracket GET error:", e);
    return NextResponse.json({ error: "대진표 조회 실패" }, { status: 500 });
  }
}

export async function PUT(
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
    const body = (await req.json()) as BracketPayload;
    const { rounds, currentRound, finished } = body;
    if (!Array.isArray(rounds) || typeof currentRound !== "number" || typeof finished !== "boolean") {
      return NextResponse.json({ error: "rounds, currentRound, finished 필요" }, { status: 400 });
    }
    await prisma.competition.update({
      where: { id: competitionId },
      data: { bracketData: { rounds, currentRound, finished } },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("bracket PUT error:", e);
    return NextResponse.json({ error: "대진표 저장 실패" }, { status: 500 });
  }
}
