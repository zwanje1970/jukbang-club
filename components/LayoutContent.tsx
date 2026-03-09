"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdminFloatButton from "@/components/layout/AdminFloatButton";
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
      <main className="flex-1 w-full bg-white">
        <div className="main-container max-w-7xl mx-auto px-4 w-full">
          {children}
        </div>
      </main>
      <Footer />
      <AdminFloatButton />
    </>
  );
}
