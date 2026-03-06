import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdminFloatButton from "@/components/layout/AdminFloatButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "죽방클럽 JUKBANG.CLUB",
  description: "당구대회 관리 - 죽방클럽 공식 사이트",
};

export const viewport: Viewport = {
  themeColor: "#171717",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col bg-white text-gray-900 antialiased`}>
        <Header />
        <main className="flex-1 w-full bg-white">
        <div className="main-container max-w-7xl mx-auto px-4 w-full">
          {children}
        </div>
      </main>
        <Footer />
        <AdminFloatButton />
      </body>
    </html>
  );
}
