import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MyProfileForm from "./MyProfileForm";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true, username: true, email: true, phone: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">회원정보 수정</h1>
      <MyProfileForm user={user} />
    </div>
  );
}
