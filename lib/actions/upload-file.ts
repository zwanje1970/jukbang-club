"use server";

import { put } from "@vercel/blob";

/**
 * 통합 업로드: 메뉴별로 Vercel Blob의 다른 폴더에 저장.
 *
 * Vercel 대시보드에서 폴더별로 보기:
 * 1. Vercel 대시보드 → 프로젝트 선택 → Storage → Blob 스토어
 * 2. Blob 파일 목록에서 pathname(경로) 기준으로 정렬하거나, pathname 필터로
 *    "notices/", "tournaments/", "settings/" 등 접두어를 검색하면 해당 메뉴 업로드만 모아서 볼 수 있음.
 */
export const UPLOAD_MENU_FOLDERS: Record<string, string> = {
  notice: "notices/",
  tournament: "tournaments/",
  settings: "settings/",
  competition: "competitions/",
  lesson: "lessons/",
  board: "boards/",
  venue: "venue/",
  broadcast: "broadcast/",
};

export type UploadFileResult = { url?: string; error?: string };

/**
 * 통합 업로드: 메뉴별로 Vercel Blob의 해당 폴더에 저장.
 * @param file - 업로드할 파일
 * @param menuName - UPLOAD_MENU_FOLDERS 키 (notice, tournament, settings, competition, lesson, board, venue, broadcast)
 */
export async function uploadFile(file: File, menuName: string): Promise<UploadFileResult> {
  if (!file || !file.size) {
    return { error: "파일이 없습니다." };
  }

  const folder = UPLOAD_MENU_FOLDERS[menuName];
  if (!folder) {
    return { error: `지원하지 않는 menuName입니다: ${menuName}. 사용 가능: ${Object.keys(UPLOAD_MENU_FOLDERS).join(", ")}` };
  }

  try {
    const ext =
      file.name.split(".").pop()?.toLowerCase() ||
      (file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg");
    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9가-힣_-]/g, "_") || "file";
    const randomNum = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
    const pathname = `${folder}${baseName}-${randomNum}.${ext}`;

    const blob = await put(pathname, file, { access: "public" });
    return { url: blob.url };
  } catch (e) {
    console.error("uploadFile error:", e);
    return { error: e instanceof Error ? e.message : "업로드 실패" };
  }
}
