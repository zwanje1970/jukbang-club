"use client";

import { useEffect, useRef, useState } from "react";

interface VenueMapProps {
  address?: string;
  lat?: number | null;
  lng?: number | null;
  name?: string;
}

/** 네이버 지도 API로 지도+마커 표시. API 키 없거나 주소만 있으면 iframe(검색)으로 대체 */
export default function VenueMap({ address, lat, lng, name }: VenueMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [useIframe, setUseIframe] = useState(false);
  const [naverReady, setNaverReady] = useState(false);

  const hasCoords = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);
  const query = (address?.trim() || name?.trim() || "").trim();

  // 네이버 스크립트 로드 대기 (API 키 없으면 iframe으로 대체)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.naver?.maps) {
      setNaverReady(true);
      return;
    }
    const id = setInterval(() => {
      if (window.naver?.maps) {
        setNaverReady(true);
        clearInterval(id);
      }
    }, 100);
    const fallback = setTimeout(() => {
      if (!window.naver?.maps && query) setUseIframe(true);
    }, 2000);
    return () => {
      clearInterval(id);
      clearTimeout(fallback);
    };
  }, [query]);

  // 지도 그리기: 좌표 있으면 바로, 주소만 있으면 Geocoding 후
  useEffect(() => {
    if (!naverReady || !containerRef.current || !window.naver?.maps) return;
    const nm = window.naver.maps;

    const showMap = (centerLat: number, centerLng: number, title?: string) => {
      const center = new nm.LatLng(centerLat, centerLng);
      const map = new nm.Map(containerRef.current!, {
        center,
        zoom: 16,
      });
      new nm.Marker({
        position: center,
        map,
        title: title || name || "위치",
      });
    };

    if (hasCoords) {
      showMap(lat as number, lng as number, name || undefined);
      return;
    }

    if (!query) {
      setUseIframe(true);
      return;
    }

    nm.Service.geocode(
      { address: query },
      (status: number, response: { result?: { items?: Array<{ point: { x: number; y: number } }> } }) => {
        const items = response?.result?.items;
        if (status !== 0 || !items?.length) {
          setUseIframe(true);
          return;
        }
        const item = items[0];
        const lng2 = item.point.x;
        const lat2 = item.point.y;
        showMap(lat2, lng2, name || undefined);
      }
    );
  }, [naverReady, hasCoords, lat, lng, query, name]);

  // API 미사용 시 또는 Geocoding 실패 시: iframe(네이버 지도 검색)
  if (useIframe || (!query && !hasCoords)) {
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

  // API로 지도 표시 (컨테이너만 먼저 렌더, useEffect에서 지도 생성)
  if (!query && !hasCoords) return null;

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-lg border border-gray-200 bg-gray-100"
      style={{ minHeight: "320px" }}
      aria-label={name || "위치 지도"}
    />
  );
}
