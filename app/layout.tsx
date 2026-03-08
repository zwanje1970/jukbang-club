import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutContent from "@/components/LayoutContent";

const naverMapClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
const naverMapScriptUrl =
  naverMapClientId &&
  `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${naverMapClientId}&submodules=geocoder`;

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
        {naverMapScriptUrl && (
          <Script src={naverMapScriptUrl} strategy="afterInteractive" />
        )}
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
