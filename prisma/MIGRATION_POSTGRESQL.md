# MySQL → Supabase(PostgreSQL) 마이그레이션

## 1. schema.prisma 변경 사항

- `provider`: `mysql` → `postgresql`
- `relationMode = "prisma"` 제거 (PostgreSQL은 FK 지원)
- 나머지 모델/필드는 그대로 사용 가능

## 2. 환경 변수

Supabase 연결 문자열 형식:

```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

또는 Direct connection (마이그레이션용):

```
postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

- Supabase 대시보드: **Project Settings → Database** 에서 connection string 복사
- `.env` / Vercel 환경 변수에 `DATABASE_URL` 로 설정

## 3. 마이그레이션 명령 (로컬에서 최초 1회)

```bash
# 의존성 설치
npm install

# Prisma 클라이언트 생성
npx prisma generate

# Supabase DB에 스키마 반영 (테이블 생성)
npx prisma db push
```

또는 마이그레이션 히스토리를 쓰려면:

```bash
npx prisma migrate dev --name init
```

## 4. 기존 MySQL 데이터 이전 (선택)

기존 MySQL DB 데이터를 Supabase로 옮기는 경우:

1. MySQL에서 데이터 덤프 (CSV 또는 SQL)
2. `npx prisma db push` 로 Supabase에 스키마 생성 후
3. Prisma의 시드 스크립트로 핵심 데이터만 넣거나, Supabase SQL Editor에서 INSERT 문 실행

시드만 다시 실행:

```bash
npx prisma db seed
```

## 5. 코드 변경 사항 (이미 반영됨)

- `app/api/applications/route.ts`: MySQL 전용 `$queryRaw` 제거 후 `prisma.application.count({ where: { competitionId, rejectedAt: null } })` 사용
- `scripts/set-database-url.js`: MySQL URL만 생성. Supabase 사용 시 **DATABASE_URL을 직접 설정**하면 됨 (스크립트 미사용 가능)

## 6. 배포 (Vercel)

1. Vercel 프로젝트 **Environment Variables** 에 Supabase `DATABASE_URL` 추가
2. 빌드: `npm run build` (내부에서 `prisma generate` 실행)
3. 배포 후 로그인 등 DB 연동 동작 확인
