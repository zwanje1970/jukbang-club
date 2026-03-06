import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email } = body;
    if (!name || !phone || !email) {
      return NextResponse.json({ error: "이름, 전화번호, 이메일을 모두 입력하세요." }, { status: 400 });
    }
    const user = await prisma.user.findFirst({
      where: { name, phone, email },
      select: { username: true },
    });
    if (!user) {
      return NextResponse.json({ error: "일치하는 회원 정보가 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, username: user.username });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
