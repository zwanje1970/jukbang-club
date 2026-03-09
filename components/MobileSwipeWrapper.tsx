"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";

/** Main menu pages in order for swipe: left = next, right = prev */
const SWIPEABLE_PATHS = ["/", "/competition", "/results", "/lesson", "/venue"] as const;

const MOBILE_BREAKPOINT_PX = 768;
const SWIPE_DELTA_MIN = 60;

export default function MobileSwipeWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const currentIndex = SWIPEABLE_PATHS.findIndex((p) => {
    const path = (pathname ?? "/").toLowerCase();
    return path === p || path === `${p}/`;
  });

  const goNext = useCallback(() => {
    if (currentIndex < 0 || currentIndex >= SWIPEABLE_PATHS.length - 1) return;
    router.push(SWIPEABLE_PATHS[currentIndex + 1]!);
  }, [currentIndex, router]);

  const goPrev = useCallback(() => {
    if (currentIndex <= 0) return;
    router.push(SWIPEABLE_PATHS[currentIndex - 1]!);
  }, [currentIndex, router]);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isMobile) return;
      goNext();
    },
    onSwipedRight: () => {
      if (!isMobile) return;
      goPrev();
    },
    delta: SWIPE_DELTA_MIN,
    preventScrollOnSwipe: false,
    trackMouse: false,
    trackTouch: true,
  });

  return (
    <div
      ref={handlers.ref}
      {...(isMobile && handlers.onMouseDown ? { onMouseDown: handlers.onMouseDown } : {})}
      className="flex-1 w-full"
    >
      {children}
    </div>
  );
}
