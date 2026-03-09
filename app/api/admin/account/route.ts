import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  try {
    const body = await req.json();
    const currentPassword = body.currentPassword;
    const newUsername = typeof body.newUsername === "string" ? body.newUsername.trim() : undefined;
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : undefined;

    if (!currentPassword) {
      return NextResponse.json({ error: "현재 비밀번호를 입력하세요." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, password: true, username: true },
    });
    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    const ok = await verifyPassword(currentPassword, user.password);
    if (!ok) {
      return NextResponse.json({ error: "현재 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    const data: { username?: string; password?: string } = {};

    if (newUsername !== undefined && newUsername !== "") {
      if (newUsername.length < 2) {
        return NextResponse.json({ error: "새 아이디는 2자 이상이어야 합니다." }, { status: 400 });
      }
      const existing = await prisma.user.findUnique({
        where: { username: newUsername },
        select: { id: true },
      });
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: "이미 사용 중인 아이디입니다." }, { status: 400 });
      }
      data.username = newUsername;
    }

    if (newPassword !== undefined && newPassword !== "") {
      if (newPassword.length < 4) {
        return NextResponse.json({ error: "새 비밀번호는 4자 이상이어야 합니다." }, { status: 400 });
      }
      data.password = await hashPassword(newPassword);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "변경할 항목(새 아이디 또는 새 비밀번호)을 입력하세요." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "변경 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
