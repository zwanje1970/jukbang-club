# 죽방클럽 홈페이지 FULL 생성 스펙

**Next.js + TypeScript + 관리자 + 회원 + 대회 + 대진표 + MySQL + 네이버지도 + Vercel**

> Cursor에서 그대로 붙여넣기만 하면 모든 구조 생성 가능

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
| `DB_HOST` | MySQL 호스트 | `localhost` 또는 외부 주소 |
| `DB_USER` | DB 사용자 | `jukbanguser` |
| `DB_PASSWORD` | DB 비밀번호 | (보안상 .env에만) |
| `DB_NAME` | DB 이름 | `jukbangclub` |
| `DB_PORT` | 포트 | `3306` |
| `NAVER_MAP_CLIENT_ID` | 네이버 지도 API (선택) | (네이버 개발자센터 발급) |

---

## 3️⃣ 관리자 페이지

- **관리자 로그인**: ID `zwanje` / PW `1010` (시드에서 설정 가능)
- **메뉴 관리**: 상단 메뉴명, 각 페이지 이미지/문구 수정
- **대회 관리**: 생성/수정, 참가자 관리, 입금확인, 진출라운드, 상금 입력
- **레슨 관리**: 등록/수정/삭제, 홍보이미지, 수강료, 기간, 레슨내용
- **게시판 관리**: 시합문의, 레슨문의

---

## 4️⃣ RichTextEditor (React-Quill)

- `components/admin/RichTextEditor.tsx` 생성
- 최상단: `import "react-quill/dist/quill.snow.css";`
- dynamic import: `const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });`
- CSS 타입 선언: `globals.d.ts`에  
  `declare module "react-quill/dist/quill.snow.css";`
- 설치: `npm install react-quill@2.0.0` (React 19는 `--legacy-peer-deps` 필요 시 사용)
- `@types/react-quill`은 npm에 없을 수 있음 → 컴포넌트 내 타입 직접 정의
- 이미지 업로드 핸들러 포함 (`/api/admin/upload` 연동)

---

## 5️⃣ 회원 기능

- **회원가입**: 이름, 아이디, 비밀번호, 이메일, 전화번호
- **정보 수정** 가능 (마이페이지)
- **ID/PW 분실**: 이름, 전화번호, 이메일 확인 후 재발급
- **시합/레슨 신청**: 회원 전용

---

## 6️⃣ 대회 관리

- **시합안내(대회안내)**: 경기규정, 대회 이미지, 참가비/총상금 자동계산
- **참가자**: 회원정보(이메일 제외), 입금자명, 본인점수, 경기기록 이미지 업로드
- **에버리지별 대회**: 0.6미만, 0.7미만, 0.8미만, 0.9미만, 1.0미만, 무제한
- **선착순 제한**, 현재 신청자 수 표시, 마감 시 안내
- **대진표**: 1~5명 경기, 1~3명 진출 가능, 라운드별 자동 계산 (`lib/bracket.ts`)
- **지난 대회 결과** 열람 가능

---

## 7️⃣ 레슨 관리

- 입문반, 기초반, 중급반, 3C반 등
- 레슨내용(이미지), 수강료, 기간, 회원 특전 안내
- 레슨 신청 및 문의 게시판

---

## 8️⃣ 당구장 안내 (대회당구장 안내)

- 이미지, 상세 안내, 지도 위치 등록
- **네이버 지도 API** 연동 (주소 입력 시 iframe 지도 표시)
- 관리자 설정에서 입력 가능

---

## 9️⃣ MySQL 연동

- **Prisma** 사용, MySQL 연결
- 테이블: 회원(User), 관리자(role), 대회(Competition), 참가(Application), 레슨(Lesson), 게시판(Board/BoardPost), 시합당구장(Venue), 설정(SiteSetting), 방송(BroadcastTable) 등
- `prisma/schema.prisma` 및 `prisma db push` / migration 포함
- Vercel·PlanetScale 사용 시 `relationMode = "prisma"` 및 인덱스 설정

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

- **환경 변수**: `DATABASE_URL` 등 위 2️⃣ 참고 (Vercel 대시보드에 등록)
- **Install Command**: `npm install --legacy-peer-deps` (필요 시)
- **Build Command**: `npm run build`
- **Output**: Next.js 기본 (`.next` 사용)
- 배포 후 URL 확인

---

## 1️⃣2️⃣ 주의 사항

- CSS는 항상 **최상단**에서 import
- `useEffect` 내 `import()` 제거 (dynamic은 컴포넌트 레벨에서)
- TypeScript용 CSS 모듈 선언 추가 (`globals.d.ts`)
- React-Quill 이미지 핸들러는 실제 업로드 API 연동 권장
- **비밀번호·API 키는 .env에만 두고 저장소에 커밋하지 않기**
