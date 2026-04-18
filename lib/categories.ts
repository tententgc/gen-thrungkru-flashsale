import type { ShopCategory } from "./types";

export const CATEGORIES: {
  key: ShopCategory;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { key: "FOOD_STREET", label: "อาหารทานเล่น", emoji: "🍢", color: "#C84B31" },
  { key: "FOOD_MAIN", label: "อาหารจานหลัก", emoji: "🍜", color: "#A53A24" },
  { key: "DRINKS", label: "เครื่องดื่ม", emoji: "🧋", color: "#2D7D6E" },
  { key: "DESSERTS", label: "ของหวาน", emoji: "🍰", color: "#E88770" },
  { key: "FRUITS", label: "ผลไม้", emoji: "🥭", color: "#FFB84D" },
  { key: "CLOTHES", label: "เสื้อผ้า", emoji: "👕", color: "#6B8EAE" },
  { key: "ACCESSORIES", label: "เครื่องประดับ", emoji: "💍", color: "#B08C5E" },
  { key: "COSMETICS", label: "เครื่องสำอาง", emoji: "💄", color: "#D8649D" },
  { key: "GROCERIES", label: "ของชำ", emoji: "🛒", color: "#6B7280" },
  { key: "OTHER", label: "อื่น ๆ", emoji: "🏪", color: "#9CA3AF" },
];

export function categoryMeta(key: ShopCategory) {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1];
}
