import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const { postId } = await params;
  const post = await prisma.boardPost.findUnique({
    where: { id: postId },
    select: { id: true, userId: true },
  });
  if (!post) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  }
  if (post.userId !== session.id) {
    return NextResponse.json({ error: "본인 글만 수정할 수 있습니다." }, { status: 403 });
  }
  try {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!title || !content) {
      return NextResponse.json({ error: "제목과 내용을 입력하세요." }, { status: 400 });
    }
    await prisma.boardPost.update({
      where: { id: postId },
      data: { title, content },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "수정 실패" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const { postId } = await params;
  const post = await prisma.boardPost.findUnique({
    where: { id: postId },
    select: { id: true, userId: true },
  });
  if (!post) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  }
  const isAdmin = session.role === "ADMIN";
  const isAuthor = post.userId === session.id;
  if (!isAdmin && !isAuthor) {
    return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
  }
  await prisma.boardPost.delete({ where: { id: postId } });
  return NextResponse.json({ ok: true });
}
