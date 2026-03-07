# 코드 규칙 (죽방클럽)

## CSS import

- **CSS는 파일 최상단에서 import**한다.
- `useEffect` 안에서 `import()` 하지 않는다.

```ts
// ✅ 좋음
import "react-quill/dist/quill.snow.css";

// ❌ 피하기
useEffect(() => {
  import("react-quill/dist/quill.snow.css");
}, []);
```

## TypeScript용 CSS 선언

- 외부 CSS 모듈 사용 시 **`globals.d.ts`** 에 선언을 추가한다.

```ts
// globals.d.ts
declare module "react-quill/dist/quill.snow.css";
```

## ReactQuill

- Next.js에서 ReactQuill은 **SSR 비활성화**로 dynamic import 한다.

```ts
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
```
