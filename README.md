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

2. **환경 변수**
   - `.env` 파일 생성 후 `DATABASE_URL` 설정 (MySQL 연결 문자열)
   - 예: `DATABASE_URL="mysql://user:password@localhost:3306/jukbangclub"`

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

1. 저장소 연결 후 프로젝트 생성
2. 환경 변수에 `DATABASE_URL` 설정 (PlanetScale, Neon 등 MySQL 호환 DB 권장)
3. 빌드 명령: `npm run build`
