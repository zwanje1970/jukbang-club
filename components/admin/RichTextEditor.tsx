"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
};

export default function RichTextEditor({ value, onChange, placeholder, height = "280px" }: RichTextEditorProps) {
  const quillRef = useRef<{ getEditor: () => { getSelection: (focus?: boolean) => { index: number; length: number } | null; insertEmbed: (index: number, type: string, url: string) => void } } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showHtml, setShowHtml] = useState(false);

  useEffect(() => {
    setMounted(true);
    import("react-quill/dist/quill.snow.css");
  }, []);

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/jpeg,image/png,image/gif,image/webp");
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "업로드 실패");
        const editor = quillRef.current?.getEditor();
        if (editor) {
          const range = editor.getSelection(true) ?? { index: 0, length: 0 };
          editor.insertEmbed(range.index, "image", data.url);
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : "업로드 실패");
      } finally {
        setUploading(false);
      }
    };
  }, []);

  const modules = useRef({
    toolbar: [
      ["bold", "italic"],
      [{ size: ["small", false, "large", "huge"] }],
      [{ color: [] }, { background: [] }],
      ["link", "image"],
      [{ list: "ordered" }, { list: "bullet" }],
    ],
    handlers: {
      image: imageHandler,
    },
  }).current;

  if (!mounted) {
    return (
      <textarea
        rows={8}
        value={value}
        readOnly
        placeholder="에디터 로딩 중..."
        className="w-full rounded border border-gray-300 px-3 py-2"
      />
    );
  }

  return (
    <div className="rich-editor">
      <div className="mb-2 flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="radio" checked={!showHtml} onChange={() => setShowHtml(false)} />
          에디터
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="radio" checked={showHtml} onChange={() => setShowHtml(true)} />
          HTML 직접 입력
        </label>
      </div>
      {showHtml ? (
        <textarea
          rows={12}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='HTML 입력. 예: <p>텍스트</p> <span class="animate-fade-in">페이드인 효과</span>'
          className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm"
        />
      ) : (
        <>
          {uploading && <p className="text-sm text-amber-600">이미지 업로드 중...</p>}
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            modules={modules}
            style={{ height }}
            className="rounded border border-gray-300 bg-white [&_.ql-container]:min-h-[200px]"
          />
        </>
      )}
      <p className="mt-2 text-xs text-gray-500">
        애니메이션: HTML 직접 입력에서 <code className="rounded bg-gray-100 px-1">&lt;span class=&quot;animate-fade-in&quot;&gt;</code> 또는 <code className="rounded bg-gray-100 px-1">animate-slide-in</code> 클래스를 사용하세요.
      </p>
    </div>
  );
}
