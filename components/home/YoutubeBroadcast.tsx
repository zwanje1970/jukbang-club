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
      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
        <span className="inline-flex h-7 w-10 shrink-0 items-center justify-center rounded overflow-hidden bg-[#ff0000]" aria-hidden>
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </span>
        유튜브 실시간 중계
      </h2>
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
