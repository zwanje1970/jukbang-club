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
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="죽방클럽" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col bg-white text-gray-900 antialiased`}>
        {naverMapScriptUrl && (
          <Script src={naverMapScriptUrl} strategy="afterInteractive" />
        )}
        <Script id="pwa-hide-address-bar" strategy="afterInteractive">
          {`(function(){var w=window;if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){w.addEventListener('load',function(){setTimeout(function(){w.scrollTo(0,1);},100);});}})();`}
        </Script>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
