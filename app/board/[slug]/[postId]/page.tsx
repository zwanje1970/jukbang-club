import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { routes } from "@/lib/routes";
import { getSession } from "@/lib/auth";
import FreeBoardPostDetail from "./FreeBoardPostDetail";

export const dynamic = "force-dynamic";

export default async function BoardPostPage({
  params,
}: {
  params: Promise<{ slug: string; postId: string }>;
}) {
  const { slug: rawSlug, postId } = await params;
  const slug = rawSlug.toLowerCase();
  if (slug !== "free") notFound();

  const post = await prisma.boardPost.findFirst({
    where: { id: postId, board: { slug: "free" } },
    include: {
      user: { select: { name: true } },
      board: { select: { name: true, slug: true } },
      _count: { select: { comments: true } },
    },
  });
  if (!post) notFound();

  const session = await getSession();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <FreeBoardPostDetail
        post={{
          id: post.id,
          userId: post.userId,
          title: post.title,
          content: post.content,
          reply: post.reply,
          replyAt: post.replyAt,
          createdAt: post.createdAt,
          user: post.user,
          _count: post._count,
        }}
        boardSlug={post.board.slug}
        boardName={post.board.name}
        exitHref={routes.boardFree}
        hasSession={!!session}
        currentUserId={session?.id ?? null}
        isAdmin={session?.role === "ADMIN"}
      />
    </div>
  );
}
