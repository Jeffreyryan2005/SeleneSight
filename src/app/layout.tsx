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
  title: "SeleneSight • Lunar Landing Site Navigator (NASA Space Apps 2026)",
  description:
    "Mission-grade 3D Lunar South Pole Navigator evaluating local topological horizons, solar illumination windows, Direct-to-Earth (DTE) comms links, and crater landing hazards for Artemis III & CLPS landers.",
  keywords: [
    "NASA Space Apps 2026",
    "Artemis III",
    "CLPS",
    "Lunar South Pole",
    "LOLA DEM",
    "JPL Horizons",
    "Lunar Landing Site Navigator",
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
