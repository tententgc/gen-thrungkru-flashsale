"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, MapIcon, FlashIcon, CrowdIcon, UserIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", icon: HomeIcon, label: "หน้าแรก" },
  { href: "/map", icon: MapIcon, label: "แผนที่" },
  { href: "/flash-sales", icon: FlashIcon, label: "Flash Sale" },
  { href: "/crowd", icon: CrowdIcon, label: "คนในตลาด" },
  { href: "/vendor/dashboard", icon: UserIcon, label: "ร้านของฉัน" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface/95 backdrop-blur"
    >
      <ul className="grid grid-cols-5">
        {TABS.map((t) => {
          const isActive = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          const Icon = t.icon;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
                  isActive ? "text-primary" : "text-muted hover:text-ink",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
