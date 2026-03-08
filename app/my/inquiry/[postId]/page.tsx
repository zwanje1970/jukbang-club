import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTimeKR } from "@/lib/date";

export const dynamic = "force-dynamic";

async function getPost(postId: string, userId: string) {
  return prisma.boardPost.findFirst({
    where: { id: postId, userId },
    include: { board: { select: { name: true, slug: true } } },
  });
}

export default async function MyInquiryDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const session = await getSession();
  if (!session) notFound();

  const { postId } = await params;
  const post = await getPost(postId, session.id);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/my" className="mb-6 inline-block text-sm text-amber-600 hover:underline">
        ← 마이페이지
      </Link>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">{post.board.name} · {formatDateTimeKR(post.createdAt)}</p>
        <h1 className="mt-1 text-xl font-semibold text-gray-800">{post.title}</h1>
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-600">문의 내용</p>
          <p className="mt-1 whitespace-pre-wrap text-gray-800">{post.content}</p>
        </div>
        {post.reply ? (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-600">관리자 답변</p>
            <p className="mt-1 whitespace-pre-wrap text-gray-800">{post.reply}</p>
            {post.replyAt && (
              <p className="mt-2 text-xs text-gray-500">{formatDateTimeKR(post.replyAt)}</p>
            )}
          </div>
        ) : (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500">아직 답변이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
