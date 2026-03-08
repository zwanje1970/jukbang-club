import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 배포 환경(Vercel)에서 DATABASE_URL이 localhost면 DB 연결 실패함. Vercel 환경 변수에 실제 DB 호스트를 설정하세요.
if (typeof process !== "undefined" && process.env.VERCEL === "1") {
  const url = process.env.DATABASE_URL ?? "";
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    console.error(
      "[prisma] Vercel 배포 환경에서는 DATABASE_URL에 localhost를 사용할 수 없습니다. Vercel 프로젝트 설정 > Environment Variables에서 실제 DB 호스트로 설정하세요."
    );
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * DB 연결 상태를 미리 확인합니다. 로그인 등 DB 사용 전에 호출해 연결 불가 시 즉시 에러 응답을 보낼 수 있습니다.
 * @returns 연결 성공 시 { ok: true }, 실패 시 { ok: false, error: string }
 */
export async function checkDatabaseConnection(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await prisma.$connect();
    return { ok: true };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    const message = err.message || String(e);
    const name = err.name || "Error";
    console.error("[prisma] DB 연결 실패:", {
      name,
      message,
      stack: err.stack,
    });
    return { ok: false, error: message };
  }
}
