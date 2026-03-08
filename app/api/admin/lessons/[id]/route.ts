import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const { slug, title, imageUrl, fee, period, content, sortOrder } = body;
    await prisma.lesson.update({
      where: { id },
      data: {
        ...(slug != null && { slug }),
        ...(title != null && { title }),
        ...(imageUrl != null && { imageUrl: imageUrl || null }),
        ...(fee != null && { fee: typeof fee === "string" ? fee : String(fee) }),
        ...(period != null && { period }),
        ...(content != null && { content }),
        ...(sortOrder != null && { sortOrder: Number(sortOrder) }),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error(e);
    const msg = e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002"
      ? "이미 사용 중인 커리큘럼입니다. 다른 커리큘럼을 선택해 주세요."
      : "수정 실패";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  const { id } = await params;
  try {
    await prisma.lesson.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
