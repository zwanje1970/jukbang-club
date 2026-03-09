import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || !file.size) {
      return NextResponse.json({ error: "파일을 선택하세요." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "이미지 파일만 업로드 가능합니다. (jpg, png, gif, webp)" },
        { status: 400 }
      );
    }

    const ext =
      file.name.split(".").pop()?.toLowerCase() ||
      (file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg");
    const pathname = `images/${nanoid(10)}.${ext}`;

    const blob = await put(pathname, file, { access: "public" });

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error("Blob upload error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "업로드 실패" },
      { status: 500 }
    );
  }
}
