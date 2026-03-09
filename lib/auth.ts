import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const SESSION_COOKIE = "jukbang_session";
// 자동로그인 시: 1년
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

export function getSessionCookieOptions(remember?: boolean) {
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
  // 자동로그인 선택 시에만 장기 유지; 미선택 시 세션 쿠키(브라우저 종료 시 로그아웃)
  if (remember !== false) {
    return { ...base, maxAge: SESSION_MAX_AGE };
  }
  return base;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function setSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, getSessionCookieOptions());
}

export async function getSession(): Promise<{ id: string; username: string; name: string; role: string } | null> {
  const cookieStore = await cookies();
  const sid = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sid) return null;
  const user = await prisma.user.findUnique({
    where: { id: sid },
    select: { id: true, username: true, name: true, role: true },
  });
  return user ? { ...user, role: user.role } : null;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function isAdmin(role: string): boolean {
  return role === "ADMIN";
}
