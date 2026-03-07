"use client";

// CSS는 파일 최상단에서 import (useEffect 내부에서 import 금지)
import dynamic from "next/dynamic";
import { useState, useEffect, useCallback, useRef } from "react";
import "react-quill/dist/quill.snow.css";

// ReactQuill은 SSR 비활성화로 dynamic import (globals.d.ts에 CSS 모듈 선언 필요)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

type RichTextEditorProps = {
  value: string;
  onChange: (val: string) => void;
};

type QuillEditor = {
  getSelection: () => { index: number } | null;
  insertEmbed: (i: number, t: string, v: string) => void;
  getLength: () => number;
  setSelection: (i: number) => void;
};

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const quillRef = useRef<{ getEditor: () => QuillEditor } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/gif,image/webp";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "업로드 실패");
        return;
      }
      const url = data.url;
      const quill = quillRef.current?.getEditor?.();
      if (quill) {
        const range = quill.getSelection();
        const index = range !== null ? range.index : quill.getLength();
        quill.insertEmbed(index, "image", url);
        quill.setSelection(index + 1);
      }
    };
    input.click();
  }, []);

  if (!mounted) return null;

  return (
    <ReactQuill
      // @ts-expect-error react-quill 타입에 ref 미정의, 런타임에 getEditor() 사용
      ref={quillRef}
      value={value}
      onChange={onChange}
      theme="snow"
      modules={{
        toolbar: {
          container: [
            ["bold", "italic", "underline", "strike"],
            [{ header: 1 }, { header: 2 }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
          ],
          handlers: { image: imageHandler },
        },
      }}
    />
  );
}
