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
    const { name, date, type, maxParticipants, entryFee, operatingFee, imageUrl, description, status } = body;
    await prisma.competition.update({
      where: { id },
      data: {
        ...(name != null && { name }),
        ...(date != null && { date: new Date(date) }),
        ...(type != null && { type }),
        ...(maxParticipants != null && { maxParticipants: Number(maxParticipants) }),
        ...(entryFee != null && { entryFee: Number(entryFee) }),
        ...(operatingFee != null && { operatingFee: Number(operatingFee) }),
        ...(imageUrl != null && { imageUrl: imageUrl || null }),
        ...(description != null && { description: description || null }),
        ...(status != null && { status }),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "수정 실패" }, { status: 500 });
  }
}
