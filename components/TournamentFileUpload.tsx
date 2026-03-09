"use client";

import { useState } from "react";
import { uploadFile } from "@/lib/actions/upload-file";

const MENU_NAME = "tournament" as const;

type Props = {
  accept?: string;
  onUploadComplete?: (url: string) => void;
  label?: string;
  className?: string;
};

export default function TournamentFileUpload({
  accept = "image/jpeg,image/png,image/gif,image/webp",
  onUploadComplete,
  label = "파일 업로드",
  className = "",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const result = await uploadFile(file, MENU_NAME);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.url) {
        console.log("[TournamentFileUpload] 업로드 완료 URL:", result.url);
        onUploadComplete?.(result.url);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 flex items-center gap-4">
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={uploading}
          className="rounded border border-gray-300 px-3 py-2 text-sm file:mr-2 file:rounded file:border-0 file:bg-amber-100 file:px-3 file:py-1 file:text-amber-800"
        />
        {uploading && <span className="text-sm text-gray-500">업로드 중...</span>}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
