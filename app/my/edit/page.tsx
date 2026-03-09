import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MyProfileForm from "../MyProfileForm";

export const dynamic = "force-dynamic";

export default async function MyEditPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true, username: true, email: true, phone: true, address: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Link href="/my" className="mb-6 inline-block text-sm text-amber-600 hover:underline">← 마이페이지</Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">회원정보 수정</h1>
      <MyProfileForm user={user} />
    </div>
  );
}
