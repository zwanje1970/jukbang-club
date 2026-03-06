import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { name, date, type, maxParticipants, entryFee, operatingFee, imageUrl, description } = body;
    if (!name || !date || !type) {
      return NextResponse.json({ error: "대회명, 날짜, 종류를 입력하세요." }, { status: 400 });
    }
    await prisma.competition.create({
      data: {
        name,
        date: new Date(date),
        type,
        maxParticipants: Number(maxParticipants) || 30,
        entryFee: Number(entryFee) || 70000,
        operatingFee: Number(operatingFee) || 10000,
        imageUrl: imageUrl || null,
        description: description || null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "생성 실패" }, { status: 500 });
  }
}
