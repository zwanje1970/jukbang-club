import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { routes } from "@/lib/routes";
import AdminAccountForm from "./AdminAccountForm";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect(routes.adminLogin);
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-800">관리자 아이디/비밀번호 변경</h1>
      <AdminAccountForm currentUsername={session.username} />
    </div>
  );
}
