export type UserRole = "CUSTOMER" | "VENDOR" | "ADMIN";

export type ShopCategory =
  | "FOOD_STREET"
  | "FOOD_MAIN"
  | "DRINKS"
  | "DESSERTS"
  | "FRUITS"
  | "CLOTHES"
  | "ACCESSORIES"
  | "COSMETICS"
  | "GROCERIES"
  | "OTHER";

export type FlashSaleStatus = "SCHEDULED" | "ACTIVE" | "ENDED" | "CANCELLED";

export type BusyLevel =
  | "VERY_QUIET"
  | "QUIET"
  | "MODERATE"
  | "BUSY"
  | "VERY_BUSY"
  | "PEAK";

export interface Vendor {
  id: string;
  slug: string;
  shopName: string;
  description: string;
  category: ShopCategory;
  phone: string;
  lineId?: string;
  coverImageUrl: string;
  logoUrl?: string;
  logoEmoji: string;
  latitude: number;
  longitude: number;
  boothNumber: string;
  openTime: string;
  closeTime: string;
  openDays: string[];
  isActive: boolean;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  followerCount: number;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  imageEmoji: string;
  imageUrl?: string;
  regularPrice: number;
  category: string;
  isAvailable: boolean;
  tags: string[];
}

export interface FlashSaleItem {
  productId: string;
  salePrice: number;
  stockLimit?: number;
  stockSold: number;
}

export interface FlashSale {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  status: FlashSaleStatus;
  items: FlashSaleItem[];
}

export interface CrowdForecastPoint {
  time: string;
  count: number;
  lower: number;
  upper: number;
  level: BusyLevel;
}
