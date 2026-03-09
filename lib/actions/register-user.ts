"use server";

import { put } from "@vercel/blob";
import { createPool } from "@vercel/postgres";
import { nanoid } from "nanoid";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export type RegisterUserState = { error?: string; success?: boolean };

export async function registerUser(
  _prev: RegisterUserState | null,
  formData: FormData
): Promise<RegisterUserState> {
  const name = (formData.get("name") as string)?.trim();
  const scoreRaw = formData.get("score");
  const file = formData.get("photo") as File | null;

  if (!name) {
    return { error: "이름을 입력하세요." };
  }

  const score = scoreRaw !== null && scoreRaw !== "" ? Number(scoreRaw) : 0;
  if (Number.isNaN(score)) {
    return { error: "점수는 숫자로 입력하세요." };
  }

  if (!file || !file.size) {
    return { error: "사진을 선택하세요." };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "이미지 파일만 가능합니다. (jpg, png, gif, webp)" };
  }

  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_CONNECTION_STRING;

  if (!connectionString) {
    return { error: "데이터베이스 연결 설정이 없습니다." };
  }

  try {
    const ext =
      file.name.split(".").pop()?.toLowerCase() ||
      (file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg");
    const pathname = `users/${nanoid(10)}.${ext}`;

    const blob = await put(pathname, file, { access: "public" });
    const profileUrl = blob.url;

    const pool = createPool({ connectionString });
    await pool.sql`
      INSERT INTO users (name, score, profile_url)
      VALUES (${name}, ${score}, ${profileUrl})
    `;

    if (typeof (pool as unknown as { end?: () => Promise<void> }).end === "function") {
      await (pool as unknown as { end: () => Promise<void> }).end();
    }

    return { success: true };
  } catch (e) {
    console.error("registerUser error:", e);
    return {
      error: e instanceof Error ? e.message : "등록에 실패했습니다.",
    };
  }
}
