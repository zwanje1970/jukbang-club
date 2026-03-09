"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDateTimeKR, formatDateTimeShortKR } from "@/lib/date";

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

type Comment = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
};

export default function FreeBoardPostDetail({
  post: initialPost,
  boardSlug,
  boardName,
  exitHref,
  hasSession,
  currentUserId,
  isAdmin,
}: {
  post: Post;
  boardSlug: string;
  boardName: string;
  exitHref: string;
  hasSession: boolean;
  currentUserId: string | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  useEffect(() => {
    fetch(`/api/boards/posts/${post.id}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []))
      .catch(() => setComments([]));
  }, [post.id]);

  const fetchComments = () => {
    fetch(`/api/boards/posts/${post.id}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []));
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInput.trim();
    if (!text || !hasSession) return;
    setLoadingComment(true);
    setError("");
    try {
      const res = await fetch(`/api/boards/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "댓글 등록 실패");
        return;
      }
      setCommentInput("");
      fetchComments();
    } finally {
      setLoadingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/boards/comments/${commentId}`, { method: "DELETE", credentials: "include" });
    if (res.ok) fetchComments();
    else setError((await res.json()).error ?? "삭제 실패");
    setEditingCommentId(null);
  };

  const startEditComment = (c: Comment) => {
    setEditingCommentId(c.id);
    setEditCommentContent(c.content);
  };

  const handleSaveCommentEdit = async () => {
    if (!editingCommentId) return;
    setLoadingEdit(true);
    setError("");
    try {
      const res = await fetch(`/api/boards/comments/${editingCommentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: editCommentContent.trim() }),
      });
      if (!res.ok) {
        setError((await res.json()).error ?? "수정 실패");
        return;
      }
      setEditingCommentId(null);
      fetchComments();
    } finally {
      setLoadingEdit(false);
    }
  };

  const startEditPost = () => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const handleSavePostEdit = async () => {
    setLoadingEdit(true);
    setError("");
    try {
      const res = await fetch(`/api/boards/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: editTitle.trim(), content: editContent.trim() }),
      });
      if (!res.ok) {
        setError((await res.json()).error ?? "수정 실패");
        return;
      }
      setPost((prev) => ({ ...prev, title: editTitle.trim(), content: editContent.trim() }));
      setEditingPostId(null);
      router.refresh();
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("글을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/boards/posts/${post.id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) router.push(exitHref);
    else setError((await res.json()).error ?? "삭제 실패");
  };

  const canEditPost = currentUserId && post.userId === currentUserId;
  const canDeletePost = (currentUserId && post.userId === currentUserId) || isAdmin;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800">{boardName}</h1>
        <Link
          href={exitHref}
          className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          목록
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <article className="rounded-lg border border-gray-200 bg-white p-4">
        {editingPostId ? (
          <div className="space-y-3">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="제목"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="내용"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSavePostEdit}
                disabled={loadingEdit}
                className="rounded bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700 disabled:opacity-50"
              >
                저장
              </button>
              <button
                type="button"
                onClick={() => setEditingPostId(null)}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-2 text-sm text-gray-500">
              <span>{post.user.name}</span>
              <span>{formatDateTimeShortKR(post.createdAt)}</span>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-gray-800">{post.title}</h2>
            <div className="mt-2 whitespace-pre-wrap text-gray-700">{post.content}</div>
            <div className="mt-3 flex gap-2">
              {canEditPost && (
                <button type="button" onClick={startEditPost} className="text-xs text-amber-600 hover:underline">
                  수정
                </button>
              )}
              {canDeletePost && (
                <button type="button" onClick={handleDeletePost} className="text-xs text-red-600 hover:underline">
                  삭제
                </button>
              )}
            </div>
            {post.reply && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-600">관리자 답변</p>
                <p className="mt-1 whitespace-pre-wrap text-gray-700">{post.reply}</p>
                {post.replyAt && (
                  <p className="mt-1 text-xs text-gray-500">{formatDateTimeKR(post.replyAt)}</p>
                )}
              </div>
            )}
          </>
        )}
      </article>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-4">
        <ul className="divide-y divide-gray-200">
          {comments.map((c) => (
            <li key={c.id} className="py-3 first:pt-0 text-sm">
              {editingCommentId === c.id ? (
                <div className="flex items-start gap-2">
                  <span className="shrink-0 text-blue-600" aria-hidden>└</span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <textarea
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                      rows={2}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveCommentEdit}
                        disabled={loadingEdit}
                        className="rounded bg-amber-600 px-2 py-1 text-xs text-white hover:bg-amber-700 disabled:opacity-50"
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCommentId(null)}
                        className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <span className="shrink-0 text-blue-600 font-medium" aria-hidden>└</span>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-gray-700">{c.user.name}</span>
                    <span className="ml-2 text-gray-500">{formatDateTimeShortKR(c.createdAt)}</span>
                    <p className="mt-0.5 whitespace-pre-wrap text-gray-700">{c.content}</p>
                    <span className="mt-1 flex gap-1">
                      {currentUserId === c.userId && (
                        <button
                          type="button"
                          onClick={() => startEditComment(c)}
                          className="text-xs text-amber-600 hover:underline"
                        >
                          수정
                        </button>
                      )}
                      {(currentUserId === c.userId || isAdmin) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          삭제
                        </button>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-gray-200 pt-4">
          {hasSession ? (
            <form onSubmit={handleSubmitComment} className="flex flex-col gap-2">
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="댓글을 입력하세요"
                rows={3}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={loadingComment || !commentInput.trim()}
                className="w-fit rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                등록
              </button>
            </form>
          ) : (
            <p className="text-sm text-gray-500">
              댓글을 쓰려면 <Link href="/login" className="text-amber-600 hover:underline">로그인</Link>해 주세요.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
