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
  const selectedTableRef = useRef<HTMLTableElement | null>(null);
  const tableBgRef = useRef<HTMLInputElement>(null);
  const tableBorderRef = useRef<HTMLInputElement>(null);
  const [selectedImgTick, setSelectedImgTick] = useState(0);
  const [selectedTableTick, setSelectedTableTick] = useState(0);

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
    selectedTableRef.current = null;
    setSelectedImgTick(0);
    setSelectedTableTick(0);
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

  useEffect(() => {
    const table = selectedTableRef.current;
    if (!table) return;
    table.style.boxShadow = "0 0 0 2px #3b82f6";
    table.style.borderRadius = "4px";
    return () => {
      table.style.boxShadow = "";
      table.style.borderRadius = "";
    };
  }, [selectedTableTick]);

  const exec = useCallback((cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML ?? "");
  }, [onChange]);

  const applyMyeongjo = useCallback(() => {
    editorRef.current?.focus();
    document.execCommand("fontName", false, "Georgia");
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
    const target = e.target as Node;
    if (target instanceof HTMLImageElement) {
      e.preventDefault();
      selectedImgRef.current = target;
      selectedTableRef.current = null;
      setSelectedImgTick((t) => t + 1);
      setSelectedTableTick(0);
      return;
    }
    const table = target instanceof HTMLTableElement ? target : (target as HTMLElement).closest?.("table");
    if (table instanceof HTMLTableElement) {
      e.preventDefault();
      selectedTableRef.current = table;
      selectedImgRef.current = null;
      setSelectedTableTick((t) => t + 1);
      setSelectedImgTick(0);
      editorRef.current?.focus();
      return;
    }
    selectedImgRef.current = null;
    selectedTableRef.current = null;
    setSelectedImgTick(0);
    setSelectedTableTick(0);
  }, []);

  const getSelectedBlock = useCallback((): HTMLImageElement | HTMLTableElement | null => {
    const sel = window.getSelection();
    const editor = editorRef.current;
    if (!sel || sel.rangeCount === 0 || !editor) return null;
    let node: Node | null = sel.anchorNode;
    while (node && node !== editor) {
      if (node instanceof HTMLImageElement) return node;
      if (node instanceof HTMLTableElement) return node;
      node = node.parentNode;
    }
    return null;
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Delete" && e.key !== "Backspace") return;
    if (selectedTableRef.current?.parentNode) {
      e.preventDefault();
      selectedTableRef.current.remove();
      selectedTableRef.current = null;
      setSelectedTableTick(0);
      syncContent();
      return;
    }
    if (selectedImgRef.current?.parentNode) {
      e.preventDefault();
      selectedImgRef.current.remove();
      selectedImgRef.current = null;
      setSelectedImgTick(0);
      syncContent();
      return;
    }
    const block = getSelectedBlock();
    if (block) {
      e.preventDefault();
      block.remove();
      if (block instanceof HTMLImageElement) {
        selectedImgRef.current = null;
        setSelectedImgTick(0);
      }
      syncContent();
    }
  }, [getSelectedBlock, syncContent]);

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

  const getSelectedTable = useCallback((): HTMLTableElement | null => {
    if (selectedTableRef.current?.parentNode) return selectedTableRef.current;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node: Node | null = sel.anchorNode;
    const editor = editorRef.current;
    while (node && node !== editor) {
      if (node instanceof HTMLTableElement) return node;
      node = node.parentNode;
    }
    return null;
  }, []);

  const insertTable = useCallback((rows: number, cols: number, options?: { bgColor?: string; borderColor?: string; borderWidth?: string }) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const bg = options?.bgColor || "";
    const borderColor = options?.borderColor || "#d1d5db";
    const borderWidth = options?.borderWidth || "1px";
    const borderStyle = `border: ${borderWidth} solid ${borderColor}; border-collapse: collapse;`;
    const cellStyle = `border: ${borderWidth} solid ${borderColor}; padding: 6px; ${bg ? `background-color: ${bg};` : ""}`;
    let html = `<table cellpadding="0" cellspacing="0" style="width: 100%; ${borderStyle}"><tbody>`;
    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) {
        html += `<td style="${cellStyle}">&nbsp;</td>`;
      }
      html += "</tr>";
    }
    html += "</tbody></table>";
    document.execCommand("insertHTML", false, html);
    syncContent();
  }, [syncContent]);

  const applyTableStyle = useCallback((opts: { bgColor?: string; borderColor?: string; borderWidth?: string }) => {
    const table = selectedTableRef.current ?? getSelectedTable();
    if (!table) {
      alert("표를 클릭해 선택한 뒤 다시 시도해 주세요.");
      return;
    }
    if (opts.bgColor !== undefined) {
      table.style.backgroundColor = opts.bgColor;
      table.querySelectorAll("td, th").forEach((cell) => {
        (cell as HTMLElement).style.backgroundColor = opts.bgColor!;
      });
    }
    if (opts.borderColor !== undefined || opts.borderWidth !== undefined) {
      const width = opts.borderWidth ?? "1px";
      const color = opts.borderColor ?? "#d1d5db";
      table.style.border = `${width} solid ${color}`;
      table.querySelectorAll("td, th").forEach((cell) => {
        (cell as HTMLElement).style.border = `${width} solid ${color}`;
      });
    }
    syncContent();
  }, [getSelectedTable, syncContent]);

  const hasImageSelected = selectedImgTick > 0 && selectedImgRef.current?.parentNode;

  return (
    <div className="border border-gray-300 rounded overflow-hidden bg-white">
      <div className="flex flex-col gap-2 border-b border-gray-200 bg-gray-50 p-2">
        <div className="flex flex-wrap items-center gap-1">
          <button type="button" onClick={() => exec("bold")} className="rounded px-2 py-1 text-sm font-bold hover:bg-gray-200" title="굵게">B</button>
          <button type="button" onClick={applyMyeongjo} className="rounded px-2 py-1 text-sm hover:bg-gray-200 font-serif italic" title="명조">I</button>
          <select onChange={(e) => exec("fontSize", e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-sm" title="글자 크기">
            <option value="">크기</option>
            <option value="1">작게</option>
            <option value="3">보통</option>
            <option value="5">크게</option>
            <option value="7">매우 크게</option>
          </select>
          <input type="color" onInput={(e) => exec("foreColor", (e.target as HTMLInputElement).value)} className="h-7 w-8 cursor-pointer rounded border border-gray-300" title="글자 색" />
          <span className="mx-1 border-l border-gray-300 pl-1 text-gray-400">|</span>
          <button type="button" onClick={() => exec("justifyLeft")} className="rounded px-2 py-1 text-sm hover:bg-gray-200" title="왼쪽 정렬">≡ 왼쪽</button>
          <button type="button" onClick={() => exec("justifyCenter")} className="rounded px-2 py-1 text-sm hover:bg-gray-200" title="가운데 정렬">≡ 가운데</button>
          <button type="button" onClick={() => exec("justifyRight")} className="rounded px-2 py-1 text-sm hover:bg-gray-200" title="오른쪽 정렬">≡ 오른쪽</button>
          <span className="mx-1 border-l border-gray-300 pl-1 text-gray-400">|</span>
          <button type="button" onClick={insertImage} className="rounded px-2 py-1 text-sm hover:bg-gray-200" title="이미지넣기">이미지넣기</button>
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
        <div className="flex flex-wrap items-center gap-1">
          <select
            onChange={(e) => {
              const v = e.target.value;
              if (v) {
                const [rows, cols] = v.split("x").map(Number);
                insertTable(rows, cols, {
                  bgColor: tableBgRef.current?.value || undefined,
                  borderColor: tableBorderRef.current?.value || undefined,
                  borderWidth: "1px",
                });
              }
              e.target.value = "";
            }}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
            title="표 넣기"
          >
            <option value="">표 넣기</option>
            <option value="2x2">2×2</option>
            <option value="2x3">2×3</option>
            <option value="3x3">3×3</option>
            <option value="3x4">3×4</option>
            <option value="4x4">4×4</option>
            <option value="4x5">4×5</option>
            <option value="5x5">5×5</option>
          </select>
          <span className="mx-1 border-l border-gray-300 pl-1 text-gray-400">|</span>
          <span className="text-gray-500 text-xs">배경</span>
          <input ref={tableBgRef} type="color" defaultValue="#f3f4f6" className="h-7 w-8 cursor-pointer rounded border border-gray-300" title="표 배경색" onInput={() => applyTableStyle({ bgColor: tableBgRef.current?.value || "#f3f4f6" })} />
          <span className="text-gray-500 text-xs">선색</span>
          <input ref={tableBorderRef} type="color" defaultValue="#374151" className="h-7 w-8 cursor-pointer rounded border border-gray-300" title="표 선색" onInput={() => applyTableStyle({ borderColor: tableBorderRef.current?.value || "#374151" })} />
          <span className="text-gray-500 text-xs">선굵기</span>
          <select
            className="rounded border border-gray-300 px-2 py-1 text-sm w-14"
            title="선 굵기"
            defaultValue="1"
            onChange={(e) => applyTableStyle({ borderWidth: `${e.target.value}px` })}
          >
            <option value="1">1px</option>
            <option value="2">2px</option>
            <option value="3">3px</option>
          </select>
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={syncContent}
        onClick={handleEditorClick}
        onKeyDown={handleKeyDown}
        className="min-h-[120px] max-h-[300px] overflow-y-auto p-3 text-gray-800 focus:outline-none [&_img]:cursor-pointer [&_table]:cursor-pointer [&_table]:border-gray-300 [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-100 [&_th]:p-2"
      />
    </div>
  );
});

export default VenueIntroEditor;
