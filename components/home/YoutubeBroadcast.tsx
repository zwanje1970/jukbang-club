"use client";

type Table = {
  tableNumber: number;
  youtubeUrl: string | null;
  status: string;
  isActive: boolean;
};

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  LIVE: { label: "방송중", className: "bg-red-500 text-white" },
  WAITING: { label: "방송대기중", className: "bg-gray-500 text-white" },
  ENDED: { label: "종료", className: "bg-gray-400 text-white" },
};

export default function YoutubeBroadcast({ tables = [] }: { tables?: Table[] }) {
  const list = Array.isArray(tables) ? tables : [];
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="mb-6 text-xl font-bold text-gray-800">유튜브 실시간 중계 (6테이블)</h2>
      {list.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-600">
          등록된 중계가 없습니다. 관리자 설정에서 중계 테이블을 추가할 수 있습니다.
        </p>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => {
          const statusInfo = STATUS_MAP[t.status] ?? STATUS_MAP.WAITING;
          const showIframe = t.isActive && t.youtubeUrl && t.status === "LIVE";
          return (
            <div
              key={t.tableNumber}
              className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
                <span className="font-semibold text-gray-800">TABLE {t.tableNumber}</span>
                <span className={`rounded px-2 py-0.5 text-xs ${statusInfo.className}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="aspect-video w-full bg-black">
                {showIframe && t.youtubeUrl ? (
                  <iframe
                    src={t.youtubeUrl.replace("watch?v=", "embed/")}
                    title={`Table ${t.tableNumber}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-500">
                    방송 대기중
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </section>
  );
}
