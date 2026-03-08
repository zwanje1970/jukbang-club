"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Notification = { id: string; message: string; createdAt: string };

const POPUP_WIDTH = 440;
const POPUP_HEIGHT = 320;

function getPopupOptions(): string {
  let left = 0;
  let top = 0;
  if (typeof window !== "undefined") {
    const s = window.screen as { availLeft?: number; availTop?: number; availWidth?: number; availHeight?: number; width?: number; height?: number };
    const availLeft = s.availLeft ?? 0;
    const availTop = s.availTop ?? 0;
    const availW = s.availWidth ?? s.width ?? 0;
    const availH = s.availHeight ?? s.height ?? 0;
    left = Math.round(availLeft + availW - 400);
    top = Math.round(availTop + availH - 200);
  }
  return [
    `width=${POPUP_WIDTH}`,
    `height=${POPUP_HEIGHT}`,
    `left=${left}`,
    `top=${top}`,
    "scrollbars=yes",
    "resizable=yes",
    "menubar=no",
    "toolbar=no",
    "location=no",
    "status=no",
    "noreferrer",
  ].join(",");
}

export default function NotificationBanner() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    fetch("/api/notifications", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications ?? []))
      .catch(() => setNotifications([]));
  }, []);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data === "notification-popup-close" && popupRef.current) {
        try {
          popupRef.current.close();
        } finally {
          popupRef.current = null;
        }
        router.push("/");
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  function openPopup() {
    popupRef.current = window.open(
      "/notifications-popup",
      "notifications",
      getPopupOptions()
    );
  }

  if (notifications.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
        <p className="mb-2 text-sm font-semibold text-gray-800">알림</p>
        <p className="mb-2 text-xs text-gray-500">알림이 있습니다. 새 창에서 확인해 주세요.</p>
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-sm text-gray-800">알림 {notifications.length}건</span>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={openPopup}
            className="rounded bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"
          >
            새 창에서 보기
          </button>
        </div>
      </div>
    </div>
  );
}
