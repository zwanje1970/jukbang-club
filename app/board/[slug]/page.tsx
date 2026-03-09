import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { routes } from "@/lib/routes";
import { formatDateTimeKR } from "@/lib/date";
import BoardWriteForm from "./BoardWriteForm";
import FreeBoardContent from "./FreeBoardContent";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const BOARD_DEFAULTS: Record<string, string> = {
  "competition-inquiry": "시합문의",
  "lesson-inquiry": "레슨문의",
  free: "자유게시판",
};

const HIDE_LIST_SLUGS = new Set(["competition-inquiry", "lesson-inquiry"]);

const EXIT_LINK: Record<string, string> = {
  "competition-inquiry": routes.competition,
  "lesson-inquiry": routes.lesson,
};

async function getBoard(slug: string) {
  return prisma.board.findUnique({
    where: { slug },
    include: {
      posts: {
        include: {
          user: { select: { name: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function BoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const rawSlug = (await params).slug;
  const slug = rawSlug.toLowerCase();
  let board = await getBoard(slug);
  if (!board && BOARD_DEFAULTS[slug]) {
    await prisma.board.create({
      data: { slug, name: BOARD_DEFAULTS[slug] },
    });
    board = await getBoard(slug);
  }
  if (!board) notFound();
  const session = await getSession();

  const hideList = HIDE_LIST_SLUGS.has(board.slug);
  const isFreeBoard = board.slug === "free";
  const exitHref = EXIT_LINK[board.slug] ?? "/";

  if (isFreeBoard) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <FreeBoardContent
          posts={board.posts}
          boardSlug={board.slug}
          boardName={board.name}
          exitHref={exitHref}
          hasSession={!!session}
          currentUserId={session?.id ?? null}
          isAdmin={session?.role === "ADMIN"}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">{board.name}</h1>
        <Link
          href={exitHref}
          className="shrink-0 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          나가기
        </Link>
      </div>
      {!hideList && (
        <>
          <ul className="space-y-4">
            {board.posts.map((p) => (
              <li key={p.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{p.user.name}</span>
                  <span>{formatDateTimeKR(p.createdAt)}</span>
                </div>
                <h2 className="mt-2 font-semibold text-gray-800">{p.title}</h2>
                <p className="mt-1 whitespace-pre-wrap text-gray-700">{p.content}</p>
                {p.reply && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <p className="text-sm font-medium text-gray-600">관리자 답변</p>
                    <p className="mt-1 whitespace-pre-wrap text-gray-700">{p.reply}</p>
                    {p.replyAt && (
                      <p className="mt-1 text-xs text-gray-500">{formatDateTimeKR(p.replyAt)}</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
          {board.posts.length === 0 && <p className="py-8 text-center text-gray-500">아직 글이 없습니다.</p>}
        </>
      )}
      {hideList && (
        <p className="mb-6 text-sm text-gray-500">문의하신 내용은 확인 후 답변 드리며, 답변 시 알림을 보내 드립니다.</p>
      )}
      <div className="mt-8">
        {session ? (
          <BoardWriteForm boardSlug={board.slug} boardName={board.name} hideTitle={hideList} />
        ) : (
          <p className="text-sm text-gray-500">
            글을 쓰려면 <Link href="/login" className="text-amber-600 hover:underline">로그인</Link>해 주세요.
          </p>
        )}
      </div>
    </div>
  );
}
