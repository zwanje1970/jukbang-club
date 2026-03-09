"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdminFloatButton from "@/components/layout/AdminFloatButton";
import MobileSwipeWrapper from "@/components/MobileSwipeWrapper";
import NotificationBanner from "@/components/NotificationBanner";
import IntroScreen from "@/components/IntroScreen";
import { REPLAY_INTRO_EVENT } from "@/components/IntroScreen";

const INTRO_SEEN_KEY = "introSeen";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showIntro, setShowIntro] = useState<boolean | null>(null);

  useEffect(() => {
    setShowIntro(typeof sessionStorage !== "undefined" ? sessionStorage.getItem(INTRO_SEEN_KEY) !== "1" : true);
  }, []);

  useEffect(() => {
    const onReplay = () => setShowIntro(true);
    window.addEventListener(REPLAY_INTRO_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_INTRO_EVENT, onReplay);
  }, []);

  const endIntro = () => {
    document.body.dataset.logoVisible = "1";
    document.querySelectorAll<HTMLElement>(".logo-ball").forEach((el) => el.style.removeProperty("opacity"));
    document.querySelectorAll<HTMLElement>(".logo-text span").forEach((t) => t.style.removeProperty("opacity"));
    if (typeof sessionStorage !== "undefined") sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    setShowIntro(false);
  };

  if (pathname?.toLowerCase() === "/notifications-popup") {
    return <>{children}</>;
  }
  return (
    <>
      {showIntro === true && <IntroScreen onEnd={endIntro} />}
      <Header />
      <NotificationBanner />
      <main className="flex-1 w-full bg-white flex flex-col">
        <MobileSwipeWrapper>
          <div className="main-container max-w-7xl mx-auto px-4 w-full">
            {children}
          </div>
        </MobileSwipeWrapper>
      </main>
      <Footer />
      <AdminFloatButton />
    </>
  );
}
