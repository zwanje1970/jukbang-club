"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDateTimeShortKR } from "@/lib/date";
import BoardWriteForm from "./BoardWriteForm";
import { routes } from "@/lib/routes";

type Post = {
  id: string;
  userId: string;
  title: string;
  content: string;
  reply: string | null;
  replyAt: Date | string | null;
  createdAt: Date | string;
  user: { name: string };
  _count?: { comments: number };
};

export default function FreeBoardContent({
  posts,
  boardSlug,
  boardName,
  exitHref,
  hasSession,
}: {
  posts: Post[];
  boardSlug: string;
  boardName: string;
  exitHref: string;
  hasSession: boolean;
  currentUserId: string | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [showWriteForm, setShowWriteForm] = useState(false);

  const handlePostSuccess = () => {
    router.refresh();
    setShowWriteForm(false);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">{boardName}</h1>
        <div className="flex shrink-0 gap-2">
          {hasSession && (
            <button
              type="button"
              onClick={() => {
                setShowWriteForm(true);
                if (typeof window !== "undefined") window.scrollTo(0, document.body.scrollHeight);
              }}
              className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              글쓰기
            </button>
          )}
          <Link
            href={exitHref}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            나가기
          </Link>
        </div>
      </div>

      {!showWriteForm ? (
        <>
          <ul className="space-y-2">
            {posts.map((p) => (
              <li key={p.id} className="rounded-lg border border-gray-200 bg-white">
                <Link
                  href={routes.boardPost(boardSlug, p.id)}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-gray-50"
                >
                  <span className="min-w-0 flex-1 truncate font-medium text-gray-800">{p.title}</span>
                  <span className="flex shrink-0 items-center gap-2 text-sm text-gray-500">
                    <span className="text-gray-400">댓글 {(p._count?.comments ?? 0)}</span>
                    <span>{p.user.name}</span>
                    <span>{formatDateTimeShortKR(p.createdAt)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {posts.length === 0 && <p className="py-8 text-center text-gray-500">아직 글이 없습니다.</p>}
          {!hasSession && (
            <p className="mt-6 text-sm text-gray-500">
              글을 쓰려면 <Link href="/login" className="text-amber-600 hover:underline">로그인</Link>해 주세요.
            </p>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowWriteForm(false)}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← 목록
          </button>
          <BoardWriteForm
            boardSlug={boardSlug}
            boardName={boardName}
            hideTitle={false}
            onSuccess={handlePostSuccess}
          />
        </div>
      )}
    </>
  );
}
