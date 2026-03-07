# 죽방클럽 관리자용 RichTextEditor + React-Quill + Next.js + TypeScript 설치 및 빌드 문제 해결

> Cursor에서 그대로 붙여넣기만 하면 생성 가능

---

## 1️⃣ 목표

- Next.js + TypeScript 환경에서 React-Quill 에디터 사용
- CSS import 문제 해결
- 관리자 페이지에서 문구/이미지 수정 가능

---

## 2️⃣ 프로젝트 파일 생성

- `components/admin/RichTextEditor.tsx`
- `globals.d.ts` (프로젝트 루트, TypeScript 전역 선언)

---

## 3️⃣ globals.d.ts 내용

```ts
declare module "react-quill/dist/quill.snow.css";
```

---

## 4️⃣ RichTextEditor.tsx (최소 버전)

```tsx
import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const imageHandler = useCallback(() => {
    alert("이미지 업로드 테스트");
  }, []);

  if (!mounted) return null;

  return (
    <ReactQuill
      value={value}
      onChange={onChange}
      modules={{
        toolbar: {
          container: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ header: 1 }, { header: 2 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image']
          ],
          handlers: { image: imageHandler }
        }
      }}
    />
  );
}
```

---

## 5️⃣ 설치 명령

```bash
npm install react-quill@2.0.0
npm install --save-dev @types/react-quill
```

> **참고**: `@types/react-quill`은 npm에 없을 수 있음. 이 경우 타입 없이 사용하거나, 컴포넌트 내에서 필요한 타입만 직접 정의하면 됨. React 19 사용 시 `--legacy-peer-deps`가 필요할 수 있음.

---

## 6️⃣ 빌드 테스트

```bash
npm run build
```

- TypeScript 오류 없이 빌드 성공
- 관리자 페이지에서 RichTextEditor 정상 작동

---

## 7️⃣ 팁

- CSS 파일은 항상 최상단에서 import
- `useEffect` 내 `import()` 제거 (dynamic은 컴포넌트 레벨에서)
- Cursor에서 붙여넣고 생성만 하면 자동 세팅 가능

---

## 이 프로젝트에서의 구현

- **현재** `components/admin/RichTextEditor.tsx`는 위 최소 버전을 확장하여, 이미지 버튼 클릭 시 `/api/admin/upload`로 파일 업로드 후 에디터에 URL을 삽입하도록 구현되어 있음.
- `theme="snow"` 사용, ref로 Quill 인스턴스 접근 시 타입에 ref가 없어 `@ts-expect-error` 처리됨.
