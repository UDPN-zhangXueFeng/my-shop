/*
 * @Author: UDPN-zhangXueFeng 84691916+UDPN-zhangXueFeng@users.noreply.github.com
 * @Date: 2026-02-05 10:31:32
 * @LastEditors: UDPN-zhangXueFeng 84691916+UDPN-zhangXueFeng@users.noreply.github.com
 * @LastEditTime: 2026-02-06 16:52:42
 * @FilePath: /my-shop/src/app/layout.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
  title: "900526",
  description: "shopping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
