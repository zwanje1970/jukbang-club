# 죽방클럽 JUKBANG.CLUB

당구대회 관리 홈페이지 (Next.js App Router + MySQL + Prisma)

## 기술 스택

- Next.js 16 (App Router), React, TypeScript
- TailwindCSS
- MySQL, Prisma ORM
- Vercel 배포 가능, 모바일 반응형, PWA 지원

## 설정

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경 변수** (로컬 / 배포 분리)
   - **로컬**: `.env.example`을 복사해 `.env.local`로 저장 후 `DATABASE_URL` 설정 (예: `mysql://user:password@localhost:3306/jukbangclub`)
   - **배포(Vercel)**: 프로젝트 설정 > Environment Variables에서 `DATABASE_URL`을 **실제 DB 호스트**로 설정 (localhost 사용 시 연결 실패)
   - (선택) 네이버 지도: `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=...` — 대회당구장 안내 지도에 사용

3. **DB 마이그레이션 및 시드**
   ```bash
   npx prisma db push
   npm run db:seed
   ```
   - 시드 후 **관리자 계정**: ID `zwanje` / PW `1010`

## 실행

- 개발: `npm run dev`
- 빌드: `npm run build`
- 프로덕션: `npm start`

## 주요 경로

- **사이트**: `/` (HOME), `/competition`, `/lesson`, `/venue`, `/results`
- **회원**: `/login`, `/signup`, `/my`, `/find-id`, `/find-pw`
- **관리자**: `/admin/login` → 로그인 후 `/admin` (대시보드, 설정, 게시판, 대회, 레슨, 중계)

## PWA

- `public/manifest.json` 설정됨. 스마트폰에서 "홈 화면에 추가" 가능.
- 아이콘: `public/icon-192.png`, `public/icon-512.png` 를 추가하면 됨 (없어도 동작).

## Vercel 배포

1. 저장소 연결 후 프로젝트 생성.
2. **환경 변수** (배포 시 반드시 실제 DB 호스트 사용, localhost 불가):
   - **방법 A**: `DATABASE_URL` 하나만 설정  
     예: `mysql://user:password@실제호스트:3306/jukbangclub`
   - **방법 B**: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` 설정 시 빌드 시 자동으로 `DATABASE_URL` 생성
3. **빌드**: 기본 `npm run build` 사용.  
   - `scripts/set-database-url.js`가 `DATABASE_URL`이 없으면 `DB_*`로 조합한 뒤 `prisma generate` → `next build` 실행.
