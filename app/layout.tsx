import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Long Ear Log · 健身饮食日志",
  description: "用漫画长兔记录每周训练与每日饮食。",
  openGraph: {
    title: "Long Ear Log · 健身饮食日志",
    description: "训练计时、逐组 Todo 与饮食照片记录。",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Long Ear Log · 健身饮食日志",
    description: "训练计时、逐组 Todo 与饮食照片记录。",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Long Ear Log",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
