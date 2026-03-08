"use client";

interface VenueMapProps {
  address?: string;
  lat?: number | null;
  lng?: number | null;
  name?: string;
}

/** "네이버 지도에서 보기"와 동일한 검색 화면을 iframe으로 표시 */
export default function VenueMap({ address, name }: VenueMapProps) {
  const query = (address?.trim() || name?.trim() || "").trim();
  if (!query) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg bg-gray-100 p-4 text-center text-sm text-gray-600">
        주소 또는 장소명을 입력해 주세요.
      </div>
    );
  }

  const searchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(query)}`;

  return (
    <iframe
      src={searchUrl}
      title={name || "위치 지도"}
      className="h-full w-full rounded-lg border-0"
      style={{ minHeight: "320px" }}
      allowFullScreen
    />
  );
}
