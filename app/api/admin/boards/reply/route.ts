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
    const { postId, reply } = body;
    if (!postId || !reply?.trim()) {
      return NextResponse.json({ error: "답변을 입력하세요." }, { status: 400 });
    }
    await prisma.boardPost.update({
      where: { id: postId },
      data: { reply: reply.trim(), replyAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}
