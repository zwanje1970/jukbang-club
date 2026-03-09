import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const { commentId } = await params;
  const comment = await prisma.boardPostComment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true },
  });
  if (!comment) {
    return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
  }
  if (comment.userId !== session.id) {
    return NextResponse.json({ error: "본인 댓글만 수정할 수 있습니다." }, { status: 403 });
  }
  try {
    const body = await req.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content) {
      return NextResponse.json({ error: "댓글 내용을 입력하세요." }, { status: 400 });
    }
    await prisma.boardPostComment.update({
      where: { id: commentId },
      data: { content },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "수정 실패" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const { commentId } = await params;
  const comment = await prisma.boardPostComment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true },
  });
  if (!comment) {
    return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
  }
  const isAdmin = session.role === "ADMIN";
  const isAuthor = comment.userId === session.id;
  if (!isAdmin && !isAuthor) {
    return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
  }
  await prisma.boardPostComment.delete({ where: { id: commentId } });
  return NextResponse.json({ ok: true });
}
