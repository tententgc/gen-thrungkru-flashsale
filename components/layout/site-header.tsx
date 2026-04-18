import Link from "next/link";
import { BellIcon, SparkIcon } from "@/components/icons";
import { SearchBar } from "@/components/search-bar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container-page flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="h-9 w-9 grid place-items-center rounded-xl bg-primary text-primary-fg shadow-pop">
            <SparkIcon className="h-5 w-5" />
          </span>
          <span className="hidden sm:flex flex-col leading-none">
            <span className="text-xs text-muted">Market PWA</span>
            <span className="font-bold text-base">ตลาดทุ่งครุ 61</span>
          </span>
        </Link>

        <div className="hidden md:block flex-1 max-w-lg">
          <SearchBar />
        </div>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link href="/flash-sales" className="btn-ghost">Flash Sale</Link>
          <Link href="/shops" className="btn-ghost">ร้านค้า</Link>
          <Link href="/crowd" className="btn-ghost">ความหนาแน่น</Link>
          <Link href="/vendor/dashboard" className="btn-ghost">สำหรับร้าน</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            aria-label="การแจ้งเตือน"
            href="/notifications"
            className="relative h-10 w-10 grid place-items-center rounded-full border border-border bg-surface hover:bg-primary-50"
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-5 min-w-[1.25rem] px-1 grid place-items-center rounded-full bg-flash text-[10px] font-bold text-white">
              3
            </span>
          </Link>
          <Link href="/login" className="btn-primary hidden sm:inline-flex">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </header>
  );
}
