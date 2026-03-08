import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ notifications: [] });
  }
  const notifications = await prisma.notification.findMany({
    where: { userId: session.id, readAt: null },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return NextResponse.json({ notifications });
}
