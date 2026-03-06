import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LessonForm from "../LessonForm";

export const dynamic = "force-dynamic";

async function getLesson(id: string) {
  return prisma.lesson.findUnique({ where: { id } });
}

export default async function AdminLessonEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = await getLesson(id);
  if (!l) notFound();
  return (
    <div>
      <Link href="/admin/lessons" className="mb-6 inline-block text-sm text-amber-600 hover:underline">← 레슨 목록</Link>
      <h1 className="mb-8 text-2xl font-bold text-gray-800">레슨 수정</h1>
      <LessonForm
        lessonId={l.id}
        initial={{
          slug: l.slug,
          title: l.title,
          imageUrl: l.imageUrl ?? "",
          fee: l.fee,
          period: l.period,
          content: l.content,
          sortOrder: l.sortOrder,
        }}
      />
    </div>
  );
}
