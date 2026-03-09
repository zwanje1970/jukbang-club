"use server";

import { put } from "@vercel/blob";

/**
 * .env.local 의 BLOB_READ_WRITE_TOKEN 을 사용해 Vercel Blob에 업로드합니다.
 * 저장 경로: 메뉴이름/파일명 (예: 공지사항 → notices/사진.jpg)
 * access: 'public' 로 누구나 이미지를 볼 수 있습니다.
 */

export type BlobUploadResult = { url?: string; error?: string };

/**
 * 메뉴 이름을 인자로 받아 '메뉴이름/파일명' 형태로 Vercel Blob에 업로드하는 공통 함수.
 * @param menuName - 메뉴 이름 (예: "공지사항", "당구장 시설 안내") → 경로는 공백 제거 등으로 정규화됨
 * @param file - 업로드할 파일
 * @returns 업로드된 URL 또는 에러 메시지
 */
export async function uploadBlob(menuName: string, file: File): Promise<BlobUploadResult> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { error: "BLOB_READ_WRITE_TOKEN이 .env.local에 설정되지 않았습니다." };
  }
  if (!file?.size) {
    return { error: "파일이 없습니다." };
  }

  const safeMenu = menuName.replace(/\s+/g, "").replace(/[^a-zA-Z0-9가-힣_-]/g, "_") || "uploads";
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9가-힣_-]/g, "_") || "file";
  const pathname = `${safeMenu}/${baseName}-${Date.now()}.${ext}`;

  try {
    const blob = await put(pathname, file, { access: "public" });
    return { url: blob.url };
  } catch (e) {
    console.error("uploadBlob error:", e);
    return { error: e instanceof Error ? e.message : "업로드 실패" };
  }
}

/**
 * 클라이언트에서 FormData로 호출할 수 있는 Server Action.
 * FormData에 'file' 키로 파일을 넣어 보냅니다.
 */
export async function uploadBlobAction(menuName: string, formData: FormData): Promise<BlobUploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "파일을 선택해 주세요." };
  }
  return uploadBlob(menuName, file);
}
