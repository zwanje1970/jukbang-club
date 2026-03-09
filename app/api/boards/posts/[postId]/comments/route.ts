import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const post = await prisma.boardPost.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  }
  const comments = await prisma.boardPostComment.findMany({
    where: { postId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ comments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  if (!(prisma as unknown as { boardPostComment?: unknown }).boardPostComment) {
    console.error("[comments] Prisma client에 boardPostComment가 없습니다. 터미널에서 개발 서버를 중지한 뒤 'npx prisma generate'와 'npx prisma db push'를 실행한 다음 서버를 다시 켜 주세요.");
    return NextResponse.json(
      {
        error: "댓글 등록 실패",
        detail: "DB 설정이 갱신되지 않았습니다. 개발 서버를 끄고, 터미널에서 npx prisma generate 와 npx prisma db push 를 실행한 뒤 서버를 다시 실행해 주세요.",
      },
      { status: 503 }
    );
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const { postId } = await params;
  const post = await prisma.boardPost.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  }
  try {
    const body = await req.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content) {
      return NextResponse.json({ error: "댓글 내용을 입력하세요." }, { status: 400 });
    }
    await prisma.boardPostComment.create({
      data: { postId, userId: session.id, content },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/boards/posts/.../comments] POST error:", e);
    const message = e instanceof Error ? e.message : String(e);
    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json(
      {
        error: "댓글 등록 실패",
        ...(isDev && { detail: message }),
      },
      { status: 500 }
    );
  }
}
