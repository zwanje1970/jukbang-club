import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/prisma";

/**
 * 배포 환경 DB 연결 상태 진단용.
 * GET /api/health → 항상 200, body에 database 상태 표시.
 * 로그인 503 원인 확인: https://www.jukbang.club/api/health
 */
export async function GET() {
  const url = process.env.DATABASE_URL ?? "";
  const isVercel = process.env.VERCEL === "1";

  if (!url.trim()) {
    return NextResponse.json(
      {
        ok: false,
        database: "missing",
        message: "DATABASE_URL이 설정되지 않았습니다. Vercel → Settings → Environment Variables에서 추가하세요.",
      },
      { status: 200 }
    );
  }

  if (isVercel && (url.includes("localhost") || url.includes("127.0.0.1"))) {
    return NextResponse.json(
      {
        ok: false,
        database: "invalid",
        message: "배포 환경에서는 DATABASE_URL에 localhost를 쓸 수 없습니다. Supabase 등 실제 DB URL(postgresql://...)으로 설정하세요.",
      },
      { status: 200 }
    );
  }

  const timeoutMs = 8000;
  const conn = await Promise.race([
    checkDatabaseConnection(),
    new Promise<{ ok: false; error: string }>((resolve) =>
      setTimeout(() => resolve({ ok: false, error: "Connection Timeout" }), timeoutMs)
    ),
  ]);

  if (!conn.ok) {
    return NextResponse.json(
      {
        ok: false,
        database: conn.error === "Connection Timeout" ? "timeout" : "error",
        message:
          conn.error === "Connection Timeout"
            ? "DB 연결 시간 초과. Supabase URL·방화벽·Pooler(6543) 확인."
            : conn.error,
      },
      { status: 200 }
    );
  }

  return NextResponse.json({ ok: true, database: "connected" }, { status: 200 });
}
