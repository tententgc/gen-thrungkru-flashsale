"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { VENDORS, PRODUCTS } from "@/lib/mock-data";
import { categoryMeta } from "@/lib/categories";

type Suggestion =
  | { kind: "shop"; href: string; title: string; subtitle: string; emoji: string }
  | { kind: "product"; href: string; title: string; subtitle: string; emoji: string };

export function SearchBar() {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo<Suggestion[]>(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const shops: Suggestion[] = VENDORS.filter(
      (v) =>
        v.shopName.toLowerCase().includes(query) ||
        v.description.toLowerCase().includes(query),
    )
      .slice(0, 4)
      .map((v) => ({
        kind: "shop",
        href: `/shops/${v.slug}`,
        title: v.shopName,
        subtitle: `${categoryMeta(v.category).label} · ${v.boothNumber}`,
        emoji: v.logoEmoji,
      }));
    const products: Suggestion[] = PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(query),
    )
      .slice(0, 4)
      .map((p) => ({
        kind: "product",
        href: `/shops/${VENDORS.find((v) => v.id === p.vendorId)?.slug ?? ""}`,
        title: p.name,
        subtitle: p.description,
        emoji: p.imageEmoji,
      }));
    return [...shops, ...products];
  }, [q]);

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 shadow-sm">
        <SearchIcon className="h-4 w-4 text-muted shrink-0" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="ค้นหาร้าน สินค้า หรือเมนู..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>
      {focused && suggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-full mt-2 z-20 card p-2 animate-slide-up">
          <ul className="divide-y divide-border">
            {suggestions.map((s) => (
              <li key={`${s.kind}-${s.title}`}>
                <Link
                  href={s.href}
                  className="flex items-center gap-3 rounded-xl p-3 hover:bg-primary-50"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-xl">
                    {s.emoji}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold truncate">{s.title}</span>
                    <span className="block text-xs text-muted truncate">{s.subtitle}</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted">
                    {s.kind === "shop" ? "ร้าน" : "สินค้า"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
