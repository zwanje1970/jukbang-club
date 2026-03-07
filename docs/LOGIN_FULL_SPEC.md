# 죽방클럽 로그인 FULL 생성 (Next.js + TypeScript + Prisma + bcrypt)

> Cursor에 붙여넣기만 하면 로그인/회원가입 API + 프론트 폼까지 생성 가능

---

## 1️⃣ 환경 변수

`.env` (실제 값은 저장소에 올리지 말 것):

- `DATABASE_URL` = PlanetScale 또는 로컬 MySQL URL
- 또는: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` (필요 시 조합해 `DATABASE_URL` 구성)

---

## 2️⃣ Prisma 모델 (User)

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

> 실제 프로젝트는 `cuid()`, `phone`, `role` 등 추가 가능.

---

## 3️⃣ 로그인 API (App Router)

- **경로**: `app/api/auth/login/route.ts` (Pages Router라면 `pages/api/login.ts`)

```ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password } = body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return NextResponse.json({ error: "사용자 없음" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "비밀번호 틀림" }, { status: 401 });

    // 로그인 성공 시 JWT 발급 또는 세션 생성
    return NextResponse.json({
      message: "로그인 성공",
      user: { id: user.id, name: user.name },
    });
  } catch (err) {
    return NextResponse.json({ error: "서버 오류", detail: String(err) }, { status: 500 });
  }
}
```

---

## 4️⃣ 회원가입 API (App Router)

- **경로**: `app/api/auth/signup/route.ts` (Pages: `pages/api/register.ts`)

```ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, username, email, password } = body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { name, username, email, password: hashed },
    });
    return NextResponse.json({
      message: "회원가입 완료",
      user: { id: user.id, name: user.name },
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "서버 오류", detail: String(err) }, { status: 500 });
  }
}
```

---

## 5️⃣ 프론트 로그인 폼

- **경로**: `components/LoginForm.tsx`

```tsx
"use client";

import { useState } from "react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "로그인 실패");
      setMessage(data.message);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "로그인 실패");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="아이디"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">로그인</button>
      <p>{message}</p>
    </form>
  );
}
```

> App Router 기준: API는 `/api/auth/login` (route.ts의 POST가 처리).

---

## 6️⃣ Prisma 클라이언트

- **경로**: `lib/prisma.ts`

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
```

---

## 7️⃣ Cursor 사용법

1. 위 코드를 **Cursor에 붙여넣기** 후 파일 생성
2. 설치: `npm install @prisma/client bcryptjs` (이미 있으면 생략)
3. 타입: `npm install --save-dev @types/bcryptjs`
4. DB: `npx prisma db push` (PlanetScale 등)
5. 빌드 후 로그인 폼 테스트: `npm run build` → `npm run dev`

---

## ✅ 요약

- 비밀번호 암호화 (bcrypt)
- Prisma + PlanetScale 대응
- Next.js App Router + TypeScript
- Cursor에서 붙여넣기로 생성 가능

---

## 이 프로젝트에서

- 로그인/회원가입은 이미 **`app/api/auth/`**, **`app/login`**, **`app/signup`**, **`lib/auth`** 에 구현되어 있음.
- 세션·쿠키 기반 인증 사용 시 위 패턴을 참고해 JWT/세션 연동하면 됨.
