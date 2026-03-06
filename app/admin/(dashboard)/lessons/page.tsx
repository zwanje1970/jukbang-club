import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getLessons() {
  return prisma.lesson.findMany({ orderBy: { sortOrder: "asc" } });
}

export default async function AdminLessonsPage() {
  const lessons = await getLessons();
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">레슨 관리</h1>
        <Link href="/admin/lessons/new" className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700">레슨 추가</Link>
      </div>
      <ul className="space-y-2">
        {lessons.map((l) => (
          <li key={l.id}>
            <Link
              href={`/admin/lessons/${l.id}`}
              className="block rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50"
            >
              {l.title} · {l.slug} · {l.fee.toLocaleString()}원
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
