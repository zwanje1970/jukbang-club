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
    const { boardSlug, title, content } = body;
    if (!boardSlug || !title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "제목과 내용을 입력하세요." }, { status: 400 });
    }
    const board = await prisma.board.findUnique({ where: { slug: boardSlug } });
    if (!board) {
      return NextResponse.json({ error: "게시판을 찾을 수 없습니다." }, { status: 404 });
    }
    await prisma.boardPost.create({
      data: { boardId: board.id, userId: session.id, title: title.trim(), content: content.trim() },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "글쓰기 실패" }, { status: 500 });
  }
}
