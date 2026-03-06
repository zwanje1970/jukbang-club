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
    for (const [key, value] of Object.entries(body)) {
      const str = value == null ? "" : String(value);
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: str },
        create: { key, value: str },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "저장 실패";
    return NextResponse.json({ error: "저장 실패", detail: message }, { status: 500 });
  }
}
