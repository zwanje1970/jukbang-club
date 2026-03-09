import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

async function getSettings() {
  const list = await prisma.siteSetting.findMany();
  return Object.fromEntries(list.map((s) => [s.key, s.value]));
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-800">메인설정</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
