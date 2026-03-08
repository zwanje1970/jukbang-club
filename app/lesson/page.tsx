import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getLessons() {
  return prisma.lesson.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

const SLUG_LABELS: Record<string, string> = {
  beginner: "입문반",
  basic: "기초반",
  intermediate: "중급반",
  "3c": "3C반",
};

export default async function LessonPage() {
  const lessons = await getLessons();
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">여성 당구교실</h1>
      <div className="mb-8">
        <Link
          href="/board/lesson-inquiry"
          className="inline-flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-6 py-4 text-lg font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
        >
          레슨문의
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {lessons.map((l) => (
          <Link
            key={l.id}
            href={`/lesson/${l.slug}`}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
          >
            {l.imageUrl && (
              <div className="relative h-40 w-full bg-gray-100">
                <img src={l.imageUrl} alt={l.title} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <h2 className="font-semibold text-gray-800">{l.title}</h2>
              <p className="mt-1 text-sm text-amber-600">{SLUG_LABELS[l.slug] ?? l.slug}</p>
              <p className="mt-1 text-sm text-gray-600">수강료 {l.fee} / {l.period}</p>
            </div>
          </Link>
        ))}
      </div>
      {lessons.length === 0 && <p className="text-center text-gray-500">등록된 레슨이 없습니다.</p>}
    </div>
  );
}
