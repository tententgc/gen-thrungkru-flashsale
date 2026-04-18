"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon } from "@/components/icons";

type Suggestion =
  | {
      kind: "shop";
      href: string;
      title: string;
      subtitle: string;
      emoji: string;
    }
  | {
      kind: "product";
      href: string;
      title: string;
      subtitle: string;
      emoji: string;
    };

interface SearchResponse {
  data: {
    shops: {
      id: string;
      slug: string;
      shopName: string;
      logoEmoji?: string;
      boothNumber?: string;
      category: string;
      description?: string;
    }[];
    products: {
      id: string;
      name: string;
      description?: string;
      imageEmoji?: string;
      vendor?: { slug: string; shopName: string };
    }[];
  };
}

function useDebounced<T>(value: T, delay = 220): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function SearchBar() {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<SearchResponse["data"] | null>(null);
  const debounced = useDebounced(q, 250);

  useEffect(() => {
    const query = debounced.trim();
    if (!query) {
      setResults(null);
      return;
    }
    const ctrl = new AbortController();
    fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((body: SearchResponse) => setResults(body.data))
      .catch(() => {
        /* aborted or failed — ignore */
      });
    return () => ctrl.abort();
  }, [debounced]);

  const suggestions: Suggestion[] = useMemo(() => {
    if (!results) return [];
    const shops: Suggestion[] = results.shops.map((s) => ({
      kind: "shop",
      href: `/shops/${s.slug}`,
      title: s.shopName,
      subtitle: `${s.category} · ${s.boothNumber ?? ""}`,
      emoji: s.logoEmoji ?? "🏪",
    }));
    const products: Suggestion[] = results.products.map((p) => ({
      kind: "product",
      href: p.vendor ? `/shops/${p.vendor.slug}` : "/",
      title: p.name,
      subtitle: p.vendor?.shopName ?? "",
      emoji: p.imageEmoji ?? "🍴",
    }));
    return [...shops, ...products];
  }, [results]);

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
            {suggestions.map((s, i) => (
              <li key={`${s.kind}-${s.title}-${i}`}>
                <Link
                  href={s.href}
                  className="flex items-center gap-3 rounded-xl p-3 hover:bg-primary-50"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-xl">
                    {s.emoji}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold truncate">{s.title}</span>
                    <span className="block text-xs text-muted truncate">
                      {s.subtitle}
                    </span>
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
