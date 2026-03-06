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
    const { lessonId } = body;
    if (!lessonId) {
      return NextResponse.json({ error: "레슨을 선택하세요." }, { status: 400 });
    }
    await prisma.lessonApplication.upsert({
      where: {
        userId_lessonId: { userId: session.id, lessonId },
      },
      update: { status: "pending" },
      create: { userId: session.id, lessonId, status: "pending" },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "신청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
