import { prisma } from "@/lib/prisma";
import MainBanner from "@/components/home/MainBanner";
import YoutubeBroadcast from "@/components/home/YoutubeBroadcast";

export const dynamic = "force-dynamic";

async function getSettings() {
  const list = await prisma.siteSetting.findMany({
    where: { key: { in: ["mainBannerUrl", "mainBannerTitle"] } },
  });
  const map = Object.fromEntries(list.map((s) => [s.key, s.value]));
  return {
    mainBannerUrl: (map.mainBannerUrl as string) || null,
    mainBannerTitle: (map.mainBannerTitle as string) || "당일 당구 시합 안내",
  };
}

async function getBroadcastTables() {
  const tables = await prisma.broadcastTable.findMany({
    orderBy: { tableNumber: "asc" },
  });
  return tables.map((t) => ({
    tableNumber: t.tableNumber,
    youtubeUrl: t.youtubeUrl,
    status: t.status,
    isActive: t.isActive,
  }));
}

export default async function HomePage() {
  const [settings, tables] = await Promise.all([getSettings(), getBroadcastTables()]);
  return (
    <>
      <MainBanner imageUrl={settings.mainBannerUrl} title={settings.mainBannerTitle} />
      <YoutubeBroadcast tables={tables} />
    </>
  );
}
