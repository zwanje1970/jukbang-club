"use client";

import { useState, useRef } from "react";

export default function BlobImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setFile(selected ?? null);
    setUrl(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { uploadFile } = await import("@/lib/actions/upload-file");
      const result = await uploadFile(file, "broadcast");
      if (result.error) throw new Error(result.error);
      if (result.url) setUrl(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "업로드 실패");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">이미지 업로드 (Vercel Blob)</h3>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="block w-full max-w-xs text-sm text-gray-600 file:mr-2 file:rounded file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:text-amber-800"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "업로드 중…" : "업로드"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {url && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">업로드된 이미지 URL</p>
          <div className="flex flex-wrap items-start gap-4">
            <div className="min-w-0 max-w-md flex-1">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-blue-600 underline break-all hover:bg-gray-100"
              >
                {url}
              </a>
            </div>
            <img
              src={url}
              alt="업로드 미리보기"
              className="h-24 w-auto rounded border border-gray-200 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
