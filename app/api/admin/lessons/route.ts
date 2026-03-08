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
    const { slug, title, imageUrl, fee, period, content, sortOrder } = body;
    if (!slug || !title) {
      return NextResponse.json({ error: "슬러그, 제목을 입력하세요." }, { status: 400 });
    }
    await prisma.lesson.create({
      data: {
        slug,
        title,
        imageUrl: imageUrl || null,
        fee: typeof fee === "string" ? fee : String(fee ?? "0"),
        period: period || "",
        content: content || "",
        sortOrder: Number(sortOrder) || 0,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error(e);
    const msg = e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002"
      ? "이미 사용 중인 커리큘럼입니다. 다른 커리큘럼을 선택하거나 기존 레슨을 수정해 주세요."
      : "생성 실패";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
