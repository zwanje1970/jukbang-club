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
    const { applicationId, round, prize, attended } = body;
    if (!applicationId) {
      return NextResponse.json({ error: "applicationId 필요" }, { status: 400 });
    }
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        ...(round != null && { round: round || null }),
        ...(prize != null && { prize: prize === "" ? null : Number(prize) }),
        ...(attended !== undefined && { attended: Boolean(attended) }),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "수정 실패" }, { status: 500 });
  }
}
