import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return {
    metadataBase: new URL(`${protocol}://${host}`),
    title: "小芽学习屋｜免费幼小衔接学习平台",
    description: "永久免费、无广告的儿童识字、拼音、数学、英语和古诗互动学习平台，可安装到 iPad。",
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, statusBarStyle: "default", title: "小芽学习屋" },
    icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
    openGraph: { title: "小芽学习屋｜免费幼小衔接学习平台", description: "识字、拼音、数学、英语、古诗，免费学。", images: ["/og.png"] },
    twitter: { card: "summary_large_image", title: "小芽学习屋｜免费幼小衔接学习平台", description: "识字、拼音、数学、英语、古诗，免费学。", images: ["/og.png"] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
