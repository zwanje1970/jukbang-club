import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, username, newPassword } = body;
    if (!name || !phone || !email || !username) {
      return NextResponse.json({ error: "이름, 전화번호, 이메일, 아이디를 모두 입력하세요." }, { status: 400 });
    }
    const user = await prisma.user.findFirst({
      where: { name, phone, email, username },
    });
    if (!user) {
      return NextResponse.json({ error: "일치하는 회원 정보가 없습니다." }, { status: 404 });
    }
    const hashed = newPassword ? await hashPassword(newPassword) : await hashPassword("temp1234");
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });
    return NextResponse.json({
      ok: true,
      message: newPassword
        ? "비밀번호가 변경되었습니다."
        : "임시 비밀번호가 설정되었습니다. 로그인 후 비밀번호를 변경하세요. (temp1234)",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
