import { prisma } from "@/lib/prisma";
import MainBanner from "@/components/home/MainBanner";
import YoutubeBroadcast from "@/components/home/YoutubeBroadcast";

export const dynamic = "force-dynamic";

const DEFAULT_TITLE = "당일 당구 시합 안내";

async function getSettings() {
  try {
    const list = await prisma.siteSetting.findMany({
      where: { key: { in: ["mainBannerUrl", "mainBannerTitle"] } },
    });
    const map = Object.fromEntries(list.map((s) => [s.key, s.value]));
    return {
      mainBannerUrl: (map.mainBannerUrl as string) || null,
      mainBannerTitle: (map.mainBannerTitle as string) || DEFAULT_TITLE,
    };
  } catch {
    return { mainBannerUrl: null, mainBannerTitle: DEFAULT_TITLE };
  }
}

async function getBroadcastTables() {
  try {
    const tables = await prisma.broadcastTable.findMany({
      orderBy: { tableNumber: "asc" },
    });
    return tables.map((t) => ({
      tableNumber: t.tableNumber,
      youtubeUrl: t.youtubeUrl,
      status: t.status,
      isActive: t.isActive,
    }));
  } catch {
    return [];
  }
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
