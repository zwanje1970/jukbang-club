import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateKR } from "@/lib/date";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { applicationId, rejectionReason } = body;
    if (!applicationId) {
      return NextResponse.json({ error: "applicationId 필요" }, { status: 400 });
    }
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { competition: true, user: true },
    });
    if (!app) {
      return NextResponse.json({ error: "신청을 찾을 수 없습니다." }, { status: 404 });
    }
    await prisma.application.update({
      where: { id: applicationId },
      data: { rejectedAt: new Date(), rejectionReason: rejectionReason?.trim() || null },
    });
    let message = `신청하신 대회에 참가가 거절되었습니다. ${app.competition.name} ${formatDateKR(app.competition.date)}`;
    if (rejectionReason?.trim()) {
      message += `\n거절사유: ${rejectionReason.trim()}`;
    }
    await prisma.notification.create({
      data: { userId: app.userId, message },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "처리 실패" }, { status: 500 });
  }
}
