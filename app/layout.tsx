import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/layout/bottom-nav";

const plexThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-thai",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ตลาดทุ่งครุ 61 — แพลตฟอร์มรวมร้านค้า + Flash Sale",
    template: "%s | ตลาดทุ่งครุ 61",
  },
  description:
    "แพลตฟอร์มรวมร้านค้าตลาดทุ่งครุ 61 แจ้งเตือน Flash Sale ใกล้ตัว พร้อมพยากรณ์ความหนาแน่นของตลาดรายชั่วโมง",
  applicationName: "ThungKhru61",
  keywords: ["ตลาดทุ่งครุ", "Flash Sale", "KMUTT", "อาหาร", "ตลาดนัด"],
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "ตลาดทุ่งครุ 61",
    description: "แพลตฟอร์มรวมร้านค้าและ Flash Sale ตลาดทุ่งครุ 61",
    type: "website",
    locale: "th_TH",
  },
};

export const viewport: Viewport = {
  themeColor: "#C84B31",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${plexThai.variable} ${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen flex flex-col bg-background text-ink">
        <SiteHeader />
        <main className="flex-1 pb-24 md:pb-8">{children}</main>
        <BottomNav />
        <footer className="hidden md:block border-t border-border bg-surface">
          <div className="container-page py-6 text-sm text-muted flex flex-col md:flex-row items-center justify-between gap-2">
            <div>© {new Date().getFullYear()} ตลาดทุ่งครุ 61 · PWA Platform</div>
            <div className="opacity-80">Built with Next.js 15 · Tailwind · Supabase (demo mock)</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
