import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";

const ADMIN_BOARD_SLUGS = ["competition-inquiry", "lesson-inquiry"];

async function getBoards() {
  return prisma.board.findMany({
    where: { slug: { in: ADMIN_BOARD_SLUGS } },
    include: {
      _count: { select: { posts: true } },
    },
    orderBy: { slug: "asc" },
  });
}

export default async function AdminBoardsPage() {
  const boards = await getBoards();
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-800">게시판 관리</h1>
      <ul className="space-y-2">
        {boards.map((b) => (
          <li key={b.id}>
            <Link
              href={routes.adminBoardsSlug(b.slug)}
              className="block rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50"
            >
              {b.name} <span className="text-gray-500">({b._count.posts}건)</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
