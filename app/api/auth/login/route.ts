import { NextRequest, NextResponse } from "next/server";
import { prisma, checkDatabaseConnection } from "@/lib/prisma";
import { verifyPassword, SESSION_COOKIE, getSessionCookieOptions } from "@/lib/auth";

function getDbConfigError(): NextResponse | null {
  const url = process.env.DATABASE_URL ?? "";
  const isVercel = process.env.VERCEL === "1";
  if (!url.trim()) {
    return NextResponse.json(
      {
        error: "데이터베이스 연결 설정이 없습니다. (DATABASE_URL 환경 변수를 설정해 주세요.)",
        code: "DB_CONFIG",
        detail: "DATABASE_URL is not set.",
      },
      { status: 503 }
    );
  }
  if (isVercel && (url.includes("localhost") || url.includes("127.0.0.1"))) {
    return NextResponse.json(
      {
        error: "배포 환경에서는 데이터베이스 주소가 localhost일 수 없습니다. Vercel 환경 변수에서 DATABASE_URL을 실제 DB 호스트로 설정해 주세요.",
        code: "DB_CONFIG",
        detail: "DATABASE_URL contains localhost/127.0.0.1 on Vercel.",
      },
      { status: 503 }
    );
  }
  return null;
}

function logLoginError(context: string, e: unknown): void {
  const err = e instanceof Error ? e : new Error(String(e));
  console.error(`[api/auth/login] ${context}:`, {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
}

export async function POST(req: NextRequest) {
  const configError = getDbConfigError();
  if (configError) return configError;

  const conn = await checkDatabaseConnection();
  if (!conn.ok) {
    logLoginError("DB 연결 실패", new Error(conn.error));
    return NextResponse.json(
      {
        error: "데이터베이스에 연결할 수 없습니다. (연결 시간 초과 또는 호스트 설정을 확인해 주세요.)",
        code: "DB_CONNECT",
        detail: conn.error,
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { username, password, admin, redirect: redirectTo } = body;
    if (!username || !password) {
      return NextResponse.json({ error: "아이디와 비밀번호를 입력하세요." }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }
    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }
    if (admin && user.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자만 접근할 수 있습니다." }, { status: 403 });
    }
    const payload = {
      ok: true,
      user: { id: user.id, username: user.username, name: user.name, role: user.role },
      redirect: admin ? "/admin" : (typeof redirectTo === "string" && redirectTo.startsWith("/") ? redirectTo : "/"),
    };
    const res = NextResponse.json(payload);
    res.cookies.set(SESSION_COOKIE, user.id, getSessionCookieOptions());
    return res;
  } catch (e) {
    logLoginError("로그인 처리 중 예외", e);
    const err = e instanceof Error ? e : new Error(String(e));
    const detail = err.message || String(e);
    return NextResponse.json(
      {
        error: "로그인 처리 중 오류가 발생했습니다.",
        code: "SERVER_ERROR",
        detail,
      },
      { status: 500 }
    );
  }
}
