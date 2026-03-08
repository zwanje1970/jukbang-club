import Link from "next/link";
import { unstable_noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import OutlineForm from "./OutlineForm";

export const dynamic = "force-dynamic";

async function getOutline() {
  unstable_noStore();
  const row = await prisma.siteSetting.findUnique({
    where: { key: "competitionOutline" },
  });
  return row?.value ?? "";
}

export default async function AdminCompetitionOutlinePage() {
  const initialHtml = await getOutline();
  return (
    <div>
      <Link href="/admin/competitions" className="mb-6 inline-block text-sm text-amber-600 hover:underline">← 대회 목록</Link>
      <h1 className="mb-8 text-2xl font-bold text-gray-800">대회요강 편집</h1>
      <OutlineForm initialHtml={initialHtml} />
    </div>
  );
}
