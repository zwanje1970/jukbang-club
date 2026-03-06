import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({ user: session });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, email, phone, newPassword } = body;
    const data: { name?: string; email?: string; phone?: string; password?: string } = {};
    if (name != null) data.name = name;
    if (email != null) data.email = email;
    if (phone != null) data.phone = phone;
    if (newPassword) data.password = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: session.id },
      data,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}
