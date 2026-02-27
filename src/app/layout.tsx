import type { Metadata } from "next";
import {
  Instrument_Serif,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";

// ─── Fonts ────────────────────────────────────────────────────────────────────

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Qianting · 股票量化分析",
  description: "输入股票代码，即刻获取多维量化评分报告",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%230f0f0f'/><path d='M6 24 L11 15 L16 18 L21 10 L26 13' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='none'/></svg>",
  },
};

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={[
        instrumentSerif.variable,
        jetbrainsMono.variable,
        plusJakartaSans.variable,
      ].join(" ")}
    >
      <body>{children}</body>
    </html>
  );
}
