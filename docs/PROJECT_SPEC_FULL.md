# 죽방클럽 홈페이지 FULL 생성 스펙

**Next.js + TypeScript + 관리자 + 회원 + 대회 + 대진표 + 레슨 + MySQL + 네이버 지도 + Vercel**

> Cursor에서 붙여넣기만 하면 모든 구조 생성 가능

---

## 1️⃣ 프로젝트 생성

- Next.js 최신 버전 + TypeScript 사용
- 프로젝트명: `jukbangclub_site`
- 기본 폴더 구조 생성

---

## 2️⃣ 환경 변수

`.env` 파일에 설정 (실제 값은 저장소에 올리지 말 것):

| 변수 | 설명 | 예시 |
|------|------|------|
| `DATABASE_URL` | Prisma용 MySQL URL | `mysql://USER:PASSWORD@HOST:PORT/DATABASE` |
| `DB_HOST` | MySQL 호스트 | `localhost` 또는 외부 MySQL 주소 |
| `DB_USER` | DB 사용자 | `jukbanguser` |
| `DB_PASSWORD` | DB 비밀번호 | (보안상 .env에만) |
| `DB_NAME` | DB 이름 | `jukbangclub` |
| `DB_PORT` | 포트 | `3306` |
| `NAVER_MAP_CLIENT_ID` | 네이버 지도 API (선택) | (네이버 개발자센터 발급) |

---

## 3️⃣ 관리자 페이지

- **관리자 ID**: zwanje / **PW**: 1010
- **메뉴 관리**: 상단 메뉴명, 각 페이지 이미지/문구 수정
- **대회 관리**: 생성/수정, 참가자 관리, 입금확인, 진출라운드, 상금 입력
- **레슨 관리**: 등록/수정/삭제, 홍보이미지, 수강료, 기간, 레슨내용
- **게시판 관리**: 시합문의, 레슨문의

---

## 4️⃣ RichTextEditor (React-Quill)

- `components/admin/RichTextEditor.tsx` 생성
- **최상단**에 `import "react-quill/dist/quill.snow.css";` 추가
- **dynamic import**: `const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });`
- **useEffect 내 CSS import 제거**
- TypeScript용 CSS 선언 **globals.d.ts** 추가:
  ```ts
  declare module "react-quill/dist/quill.snow.css";
  ```
- 이미지 업로드 핸들러 포함
- 설치:
  - `npm install react-quill@2.0.0`
  - `npm install --save-dev @types/react-quill` (npm에 없을 수 있음 → 타입 직접 정의)

---

## 5️⃣ 회원 기능

- **회원가입**: 이름, 아이디, 비밀번호, 이메일
- **정보 수정** 가능
- **ID/PW 분실**: 이름, 전화번호, 이메일 확인 후 재발급
- **시합/레슨 신청** 가능 (회원 전용)

---

## 6️⃣ 대회 관리

- 시합안내, 경기규정 안내, 대회 이미지, 참가비/총상금 자동계산
- **참가자**: 이메일 제외 회원정보, 입금자명, 본인점수, 경기기록 이미지 업로드
- **에버리지별 대회**: 0.6미만, 0.7미만, 0.8미만, 0.9미만, 1.0미만, 무제한
- 선착순 제한, 현재 신청자 수 표시, 마감 시 안내
- **대진표**: 1~5명 경기, 1~3명 진출 가능, 각 라운드별 자동 계산
- 지난 대회 결과 열람 가능

---

## 7️⃣ 레슨 관리

- 입문반, 기초반, 중급반, 3C반
- 레슨내용 이미지, 수강료, 기간, 회원 특전 안내
- 레슨 신청 및 문의 게시판

---

## 8️⃣ 당구장 안내

- 이미지, 상세 안내, 지도 위치 등록 (네이버 지도 API 연동)
- 관리자에서 입력 가능
- 네이버 지도 인증키 사용 (개발자센터 발급)

---

## 9️⃣ MySQL 연동

- **Prisma** 사용, DB 연결
- 테이블 생성: 회원, 관리자, 대회, 참가자, 레슨, 게시판, 시합당구장
- Prisma schema 및 migration 포함

### Prisma 예시

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  username  String   @unique
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}
```

> 실제 프로젝트는 `cuid()`, `phone`, `role` 등 추가 필드 사용 가능.

---

## 🔟 GitHub 업로드

```bash
git init
git remote add origin https://github.com/zwanje1970/jukbang-club.git
git add .
git commit -m "Cursor에서 생성된 죽방클럽 홈페이지 초기 업로드"
git branch -M main
git push -u origin main
```

- 상세: 프로젝트 루트 `GITHUB_UPLOAD.md` 참고

---

## 1️⃣1️⃣ Vercel 배포

- **환경 변수 등록**: 위 2️⃣ 항목 (6개 등)
- **Install Command**: `npm install --legacy-peer-deps`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- 배포 완료 후 URL 확인

---

## 1️⃣2️⃣ 주의 사항

- **CSS는 반드시 최상단 import**
- **useEffect 내 import() 제거**
- **TypeScript용 CSS 선언 추가** (globals.d.ts)
- **ReactQuill 이미지 핸들러** 테스트 포함
- **Cursor에서 붙여넣기만 하면** 모든 구조 생성 가능
- 비밀번호·API 키는 .env에만 두고 저장소에 커밋하지 않기
