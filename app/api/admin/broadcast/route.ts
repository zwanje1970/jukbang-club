import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { tableId, youtubeUrl, status, isActive } = body;
    if (!tableId) {
      return NextResponse.json({ error: "tableId 필요" }, { status: 400 });
    }
    await prisma.broadcastTable.update({
      where: { id: tableId },
      data: {
        ...(youtubeUrl != null && { youtubeUrl }),
        ...(status != null && { status }),
        ...(isActive != null && { isActive }),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}
