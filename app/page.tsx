import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import MainBanner from "@/components/home/MainBanner";
import YoutubeBroadcast from "@/components/home/YoutubeBroadcast";

export const dynamic = "force-dynamic";

const DEFAULT_TITLE = "당일 당구시합 안내";

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

/** 대진표가 있는 가장 최근 대회 id + 예선 조 라벨 + 테이블별 경기자 명단 (준결/결승 테이블 지정 반영) */
async function getLatestCompetitionWithBracket(): Promise<{
  id: string;
  tableLabels: string[];
  tableParticipants: Record<number, string[]>;
} | null> {
  try {
    const list = await prisma.competition.findMany({
      where: { bracketData: { not: Prisma.DbNull } },
      orderBy: { date: "desc" },
      take: 1,
      select: { id: true, bracketData: true },
    });
    const raw = list[0]?.bracketData;
    if (!raw || typeof raw !== "object" || !("rounds" in raw)) return null;
    const rounds = (raw as { rounds?: unknown[] }).rounds;
    if (!Array.isArray(rounds) || rounds.length === 0) return null;
    const round0 = rounds[0] as { players?: string[] }[] | undefined;
    const tableLabels = Array.isArray(round0)
      ? round0.map((_, gi) => `예선${gi + 1}조`)
      : [];
    const tableParticipants: Record<number, string[]> = {};
    if (Array.isArray(round0)) {
      round0.forEach((g, gi) => {
        if (Array.isArray(g?.players)) tableParticipants[gi + 1] = g.players;
      });
    }
    rounds.slice(1).forEach((round) => {
      if (!Array.isArray(round)) return;
      (round as { players?: string[]; tableNumber?: number }[]).forEach((g) => {
        if (g?.tableNumber != null && Array.isArray(g.players))
          tableParticipants[g.tableNumber] = g.players;
      });
    });
    return { id: list[0].id, tableLabels, tableParticipants };
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [settings, tables, competitionWithBracket] = await Promise.all([
    getSettings(),
    getBroadcastTables(),
    getLatestCompetitionWithBracket(),
  ]);
  return (
    <>
      <MainBanner imageUrl={settings.mainBannerUrl} title={settings.mainBannerTitle} />
      <YoutubeBroadcast
        tables={tables}
        participantListHref={competitionWithBracket?.id ?? null}
        tableLabels={competitionWithBracket?.tableLabels ?? null}
        tableParticipants={competitionWithBracket?.tableParticipants ?? null}
      />
    </>
  );
}
