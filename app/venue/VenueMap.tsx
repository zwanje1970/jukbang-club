"use client";

const NAVER_MAP_KEY = "fnut3c0bvd";

export default function VenueMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_MAP_KEY}`;
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-gray-100">
      <iframe
        title={name}
        src={`https://map.naver.com/v5/search/${encodeURIComponent(name)}/place`}
        className="h-full w-full border-0"
        allowFullScreen
      />
    </div>
  );
}
