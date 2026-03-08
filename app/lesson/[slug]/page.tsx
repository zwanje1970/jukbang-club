import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import LessonApplyButton from "./LessonApplyButton";

export const dynamic = "force-dynamic";

async function getLesson(slug: string) {
  return prisma.lesson.findUnique({ where: { slug } });
}

export default async function LessonDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = await getLesson(slug);
  if (!lesson) notFound();
  const session = await getSession();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {lesson.imageUrl && (
        <div className="mb-8 overflow-hidden rounded-lg">
          <img src={lesson.imageUrl} alt={lesson.title} className="h-64 w-full object-cover md:h-80" />
        </div>
      )}
      <h1 className="mb-4 text-2xl font-bold text-gray-800">{lesson.title}</h1>
      <dl className="space-y-2 text-gray-700">
        <div>
          <dt className="font-medium">수강료</dt>
          <dd>{lesson.fee}</dd>
        </div>
        <div>
          <dt className="font-medium">레슨 기간</dt>
          <dd>{lesson.period}</dd>
        </div>
      </dl>
      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-2 font-semibold">레슨 소개 / 회원 특전</h2>
        <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: lesson.content }} />
      </div>
      <div className="mt-8">
        {session ? (
          <LessonApplyButton lessonId={lesson.id} />
        ) : (
          <p className="text-gray-600">레슨 신청은 로그인 후 가능합니다.</p>
        )}
      </div>
    </div>
  );
}
