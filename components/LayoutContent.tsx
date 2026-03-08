"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdminFloatButton from "@/components/layout/AdminFloatButton";
import NotificationBanner from "@/components/NotificationBanner";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.toLowerCase() === "/notifications-popup") {
    return <>{children}</>;
  }
  return (
    <>
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
