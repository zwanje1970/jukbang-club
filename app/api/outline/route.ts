import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const row = await prisma.siteSetting.findUnique({
    where: { key: "competitionOutline" },
  });
  const html = row?.value ?? "";
  return NextResponse.json({ html });
}
