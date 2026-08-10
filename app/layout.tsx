import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "小芽学习屋｜幼小衔接工作台",
  description: "集每日学习、趣味闯关、打卡积分与自定义任务于一体的幼小衔接工作台。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
