"use client";

import { useRef, useCallback, useEffect, useImperativeHandle, forwardRef, useState } from "react";

export type VenueIntroEditorRef = { getValue: () => string };

type VenueIntroEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

const VenueIntroEditor = forwardRef<VenueIntroEditorRef, VenueIntroEditorProps>(function VenueIntroEditor({ value, onChange }, ref) {
  const editorRef = useRef<HTMLDivElement>(null);
  const selectedImgRef = useRef<HTMLImageElement | null>(null);
  const [selectedImgTick, setSelectedImgTick] = useState(0);

  useImperativeHandle(ref, () => ({
    getValue: () => editorRef.current?.innerHTML ?? "",
  }), []);

  useEffect(() => {
    if (!editorRef.current) return;
    const next = value || "";
    if (editorRef.current.innerHTML !== next) {
      editorRef.current.innerHTML = next;
    }
    selectedImgRef.current = null;
    setSelectedImgTick(0);
  }, [value]);

  useEffect(() => {
    const img = selectedImgRef.current;
    if (!img) return;
    img.style.boxShadow = "0 0 0 2px #3b82f6";
    img.style.borderRadius = "4px";
    return () => {
      img.style.boxShadow = "";
      img.style.borderRadius = "";
    };
  }, [selectedImgTick]);

  const exec = useCallback((cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML ?? "");
  }, [onChange]);

  const insertImageAtCursor = useCallback((url: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const sel = window.getSelection();
    const range = sel?.rangeCount ? sel.getRangeAt(0) : null;
    const img = document.createElement("img");
    img.src = url;
    img.alt = "첨부 이미지";
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    try {
      if (range && range.commonAncestorContainer) {
        range.collapse(true);
        range.insertNode(img);
        range.setStartAfter(img);
        range.setEndAfter(img);
        sel?.removeAllRanges();
        sel?.addRange(range);
      } else {
        editor.appendChild(img);
      }
    } catch {
      editor.appendChild(img);
    }
    onChange(editor.innerHTML);
  }, [onChange]);

  const insertImage = useCallback(async () => {
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
      if (!res.ok) return alert(data.error || "업로드 실패");
      insertImageAtCursor(data.url);
    };
    input.click();
  }, [insertImageAtCursor]);

  const syncContent = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? "";
    onChange(html);
  }, [onChange]);

  const handleInput = useCallback(() => {
    syncContent();
  }, [syncContent]);

  const handleEditorClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target;
    if (target instanceof HTMLImageElement) {
      e.preventDefault();
      selectedImgRef.current = target;
      setSelectedImgTick((t) => t + 1);
    } else {
      selectedImgRef.current = null;
      setSelectedImgTick(0);
    }
  }, []);

  const deleteSelectedImage = useCallback(() => {
    const img = selectedImgRef.current;
    if (!img?.parentNode) return;
    img.remove();
    selectedImgRef.current = null;
    setSelectedImgTick(0);
    syncContent();
  }, [syncContent]);

  const setSelectedImageWidth = useCallback((width: string) => {
    const img = selectedImgRef.current;
    if (!img) return;
    img.style.width = width;
    img.style.maxWidth = width;
    syncContent();
  }, [syncContent]);

  const hasImageSelected = selectedImgTick > 0 && selectedImgRef.current?.parentNode;

  return (
    <div className="border border-gray-300 rounded overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
        <button type="button" onClick={() => exec("bold")} className="rounded px-2 py-1 text-sm font-bold hover:bg-gray-200" title="굵게">B</button>
        <button type="button" onClick={() => exec("italic")} className="rounded px-2 py-1 text-sm italic hover:bg-gray-200" title="기울임">I</button>
        <select onChange={(e) => exec("fontSize", e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-sm" title="글자 크기">
          <option value="">크기</option>
          <option value="1">작게</option>
          <option value="3">보통</option>
          <option value="5">크게</option>
          <option value="7">매우 크게</option>
        </select>
        <input type="color" onInput={(e) => exec("foreColor", (e.target as HTMLInputElement).value)} className="h-7 w-8 cursor-pointer rounded border border-gray-300" title="글자 색" />
        <button type="button" onClick={insertImage} className="rounded px-2 py-1 text-sm hover:bg-gray-200" title="이미지 넣기">🖼 이미지</button>
        {hasImageSelected && (
          <>
            <span className="mx-1 border-l border-gray-300 pl-1 text-gray-500">|</span>
            <button type="button" onClick={deleteSelectedImage} className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-100" title="선택 이미지 삭제">삭제</button>
            <span className="text-gray-500 text-sm">크기:</span>
            {["50%", "75%", "100%", "150%"].map((w) => (
              <button key={w} type="button" onClick={() => setSelectedImageWidth(w)} className="rounded px-2 py-1 text-sm hover:bg-gray-200" title={`너비 ${w}`}>{w}</button>
            ))}
          </>
        )}
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={syncContent}
        onClick={handleEditorClick}
        className="min-h-[120px] max-h-[300px] overflow-y-auto p-3 text-gray-800 focus:outline-none [&_img]:cursor-pointer"
      />
    </div>
  );
});

export default VenueIntroEditor;
