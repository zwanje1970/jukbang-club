import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  await clearSession();
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/";
  return NextResponse.redirect(new URL(next, url.origin));
}
