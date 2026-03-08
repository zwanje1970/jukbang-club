import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, username, password, email, phone, address } = body;
    if (!name || !username || !password || !email || !phone || !address) {
      return NextResponse.json({ error: "모든 필드를 입력하세요." }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "이미 사용 중인 아이디입니다." }, { status: 400 });
    }
    const hashed = await hashPassword(password);
    await prisma.user.create({
      data: { name, username, password: hashed, email, phone, address: address, role: "USER" },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "회원가입 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
