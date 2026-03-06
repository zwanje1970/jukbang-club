import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BoardReplyForm from "./BoardReplyForm";
import { formatDateTimeKR } from "@/lib/date";

export const dynamic = "force-dynamic";

async function getBoard(slug: string) {
  return prisma.board.findUnique({
    where: { slug },
    include: {
      posts: {
        include: { user: { select: { name: true, username: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function AdminBoardDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const board = await getBoard(slug);
  if (!board) notFound();

  return (
    <div>
      <Link href="/admin/boards" className="mb-6 inline-block text-sm text-amber-600 hover:underline">← 게시판 목록</Link>
      <h1 className="mb-8 text-2xl font-bold text-gray-800">{board.name}</h1>
      <ul className="space-y-4">
        {board.posts.map((p) => (
          <li key={p.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{p.user.name} ({p.user.username})</span>
              <span>{formatDateTimeKR(p.createdAt)}</span>
            </div>
            <h3 className="mt-2 font-medium">{p.title}</h3>
            <p className="mt-1 whitespace-pre-wrap text-gray-700">{p.content}</p>
            {p.reply ? (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-600">관리자 답변</p>
                <p className="mt-1 whitespace-pre-wrap text-gray-700">{p.reply}</p>
              </div>
            ) : (
              <BoardReplyForm postId={p.id} />
            )}
          </li>
        ))}
      </ul>
      {board.posts.length === 0 && <p className="text-gray-500">글이 없습니다.</p>}
    </div>
  );
}
