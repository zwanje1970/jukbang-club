import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

/** 로그인한 회원용 이미지 업로드 (참가 신청 경기기록 등) */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || !file.size) {
      return NextResponse.json({ error: "파일을 선택하세요." }, { status: 400 });
    }
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "이미지 파일만 업로드 가능합니다. (jpg, png, gif, webp)" }, { status: 400 });
    }
    const ext = path.extname(file.name) || (file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg");
    const name = `${nanoid(10)}${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", "records");
    await mkdir(dir, { recursive: true });
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(path.join(dir, name), buffer);
    const url = `/uploads/records/${name}`;
    return NextResponse.json({ url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "업로드 실패" }, { status: 500 });
  }
}
