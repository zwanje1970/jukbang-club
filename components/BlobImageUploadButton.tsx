"use client";

import { useState, useRef } from "react";
import { uploadBlobAction } from "@/lib/blob-upload";

type Props = {
  /** 메뉴 이름 (저장 경로: 메뉴이름/파일명) */
  menuName: string;
  /** 버튼에 표시할 문구 */
  label?: string;
  /** 업로드 완료 시 URL 전달 (예: 에디터에 이미지 삽입) */
  onUploaded?: (url: string) => void;
};

/**
 * lib/blob-upload 의 uploadBlob 을 사용하는 이미지 업로드 버튼 예시.
 * 메뉴 이름을 인자로 받아 '메뉴이름/파일명' 형태로 Blob에 저장합니다.
 */
export default function BlobImageUploadButton({ menuName, label = "이미지 업로드", onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadBlobAction(menuName, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.url) {
        setLastUrl(result.url);
        onUploaded?.(result.url);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
      inputRef.current?.form?.reset();
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleChange}
        className="hidden"
        id={`blob-upload-${menuName.replace(/\s/g, "-")}`}
      />
      <label
        htmlFor={`blob-upload-${menuName.replace(/\s/g, "-")}`}
        className={`inline-flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm font-medium transition ${
          uploading
            ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-500"
            : "border-gray-400 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        {uploading ? "업로드 중…" : label}
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {lastUrl && (
        <p className="text-sm text-gray-600">
          업로드 완료:{" "}
          <a href={lastUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            이미지 보기
          </a>
        </p>
      )}
    </div>
  );
}
