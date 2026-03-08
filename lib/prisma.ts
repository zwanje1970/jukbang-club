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
