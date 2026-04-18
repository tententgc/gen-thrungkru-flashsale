import type {
  BusyLevel,
  CrowdForecastPoint,
  FlashSale,
  Product,
  Vendor,
} from "./types";
import { MARKET_CENTER } from "./geo";
import { PRODUCT_IMAGES, VENDOR_IMAGES } from "./images";

// Stable pseudo-random so snapshots don't flicker between renders.
function seeded(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s * 9301 + 49297) | 0;
    s = (s ^ (s >>> 13)) | 0;
    return (Math.abs(s) % 1_000_000) / 1_000_000;
  };
}

const rnd = seeded(61);

function jitter(base: number, meters: number): number {
  // Approximate: 1° latitude ~ 111_000 m
  const delta = (rnd() - 0.5) * 2 * (meters / 111_000);
  return base + delta;
}

const openDaysAll = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const openDaysWeekNights = ["mon", "tue", "wed", "thu", "fri"];
const openDaysWeekend = ["fri", "sat", "sun"];

export const VENDORS: Vendor[] = [
  {
    id: "v-01",
    slug: "pa-nuan-noodle",
    shopName: "ก๋วยเตี๋ยวป้านวล",
    description: "ก๋วยเตี๋ยวหมูสูตรดั้งเดิม น้ำซุปเคี่ยว 6 ชม. เสิร์ฟร้อน ๆ",
    category: "FOOD_MAIN",
    phone: "081-234-5678",
    lineId: "@panuan",
    coverImageUrl: "",
    logoEmoji: "🍜",
    latitude: jitter(MARKET_CENTER.lat, 150),
    longitude: jitter(MARKET_CENTER.lng, 150),
    boothNumber: "A-12",
    openTime: "17:00",
    closeTime: "23:00",
    openDays: openDaysAll,
    isActive: true,
    isVerified: true,
    rating: 4.7,
    reviewCount: 213,
    followerCount: 521,
  },
  {
    id: "v-02",
    slug: "tod-man-pla-lek",
    shopName: "ทอดมันปลาเจ๊เล็ก",
    description: "ทอดมันปลาอินทรีแท้ 100% กรอบนอกนุ่มใน",
    category: "FOOD_STREET",
    phone: "089-112-4433",
    coverImageUrl: "",
    logoEmoji: "🍤",
    latitude: jitter(MARKET_CENTER.lat, 120),
    longitude: jitter(MARKET_CENTER.lng, 120),
    boothNumber: "A-18",
    openTime: "16:30",
    closeTime: "22:30",
    openDays: openDaysAll,
    isActive: true,
    isVerified: true,
    rating: 4.8,
    reviewCount: 342,
    followerCount: 812,
  },
  {
    id: "v-03",
    slug: "cha-yen-moma",
    shopName: "ชาเย็นโมมา",
    description: "ชาไทยเข้มข้น ใส่น้ำตาลน้อยได้ บริการรวดเร็ว",
    category: "DRINKS",
    phone: "098-765-4321",
    lineId: "@chayenmoma",
    coverImageUrl: "",
    logoEmoji: "🧋",
    latitude: jitter(MARKET_CENTER.lat, 100),
    longitude: jitter(MARKET_CENTER.lng, 100),
    boothNumber: "B-05",
    openTime: "15:00",
    closeTime: "23:00",
    openDays: openDaysAll,
    isActive: true,
    isVerified: true,
    rating: 4.6,
    reviewCount: 188,
    followerCount: 344,
  },
  {
    id: "v-04",
    slug: "mango-sticky-rice",
    shopName: "ข้าวเหนียวมะม่วงเจ๊แอน",
    description: "มะม่วงน้ำดอกไม้หวานฉ่ำ ข้าวเหนียวมูลกะทิสด",
    category: "DESSERTS",
    phone: "082-345-6789",
    coverImageUrl: "",
    logoEmoji: "🥭",
    latitude: jitter(MARKET_CENTER.lat, 180),
    longitude: jitter(MARKET_CENTER.lng, 180),
    boothNumber: "C-07",
    openTime: "16:00",
    closeTime: "22:00",
    openDays: openDaysWeekend,
    isActive: true,
    isVerified: true,
    rating: 4.9,
    reviewCount: 476,
    followerCount: 1203,
  },
  {
    id: "v-05",
    slug: "phad-kra-pao",
    shopName: "ผัดกะเพราพี่ต้น",
    description: "กะเพราหมูสับ ไข่ดาวลาวา ข้าวสวยร้อน ๆ",
    category: "FOOD_MAIN",
    phone: "081-999-0012",
    coverImageUrl: "",
    logoEmoji: "🍳",
    latitude: jitter(MARKET_CENTER.lat, 220),
    longitude: jitter(MARKET_CENTER.lng, 220),
    boothNumber: "A-03",
    openTime: "11:00",
    closeTime: "22:00",
    openDays: openDaysAll,
    isActive: true,
    isVerified: true,
    rating: 4.5,
    reviewCount: 156,
    followerCount: 275,
  },
  {
    id: "v-06",
    slug: "som-tam-fai",
    shopName: "ส้มตำไฟริมทาง",
    description: "ส้มตำปูปลาร้า ตำสดต่อหน้า เผ็ดแซ่บระดับโปร",
    category: "FOOD_STREET",
    phone: "086-543-2100",
    coverImageUrl: "",
    logoEmoji: "🥗",
    latitude: jitter(MARKET_CENTER.lat, 250),
    longitude: jitter(MARKET_CENTER.lng, 250),
    boothNumber: "D-11",
    openTime: "15:00",
    closeTime: "23:30",
    openDays: openDaysAll,
    isActive: true,
    isVerified: true,
    rating: 4.7,
    reviewCount: 289,
    followerCount: 602,
  },
  {
    id: "v-07",
    slug: "fresh-fruits-papa",
    shopName: "ผลไม้สดคุณพ่อ",
    description: "ผลไม้ตามฤดูกาล คัดอย่างดี ราคาเป็นมิตรกับนักศึกษา",
    category: "FRUITS",
    phone: "094-222-3344",
    coverImageUrl: "",
    logoEmoji: "🍉",
    latitude: jitter(MARKET_CENTER.lat, 300),
    longitude: jitter(MARKET_CENTER.lng, 300),
    boothNumber: "E-02",
    openTime: "10:00",
    closeTime: "21:00",
    openDays: openDaysAll,
    isActive: true,
    isVerified: false,
    rating: 4.3,
    reviewCount: 78,
    followerCount: 120,
  },
  {
    id: "v-08",
    slug: "bingsu-kuma",
    shopName: "บิงซูคุมะ",
    description: "บิงซูนมฮอกไกโด เนื้อเนียน topping แน่น",
    category: "DESSERTS",
    phone: "092-003-9911",
    lineId: "@bingsukuma",
    coverImageUrl: "",
    logoEmoji: "🍧",
    latitude: jitter(MARKET_CENTER.lat, 140),
    longitude: jitter(MARKET_CENTER.lng, 140),
    boothNumber: "C-14",
    openTime: "16:00",
    closeTime: "23:00",
    openDays: openDaysWeekNights,
    isActive: true,
    isVerified: true,
    rating: 4.8,
    reviewCount: 231,
    followerCount: 438,
  },
  {
    id: "v-09",
    slug: "tshirt-mommom",
    shopName: "เสื้อยืดม่ะม๊ะ",
    description: "เสื้อยืดลายลิมิเต็ด เริ่มต้น 99 บาท",
    category: "CLOTHES",
    phone: "083-111-2222",
    coverImageUrl: "",
    logoEmoji: "👕",
    latitude: jitter(MARKET_CENTER.lat, 260),
    longitude: jitter(MARKET_CENTER.lng, 260),
    boothNumber: "F-09",
    openTime: "17:00",
    closeTime: "22:30",
    openDays: openDaysWeekend,
    isActive: true,
    isVerified: false,
    rating: 4.2,
    reviewCount: 42,
    followerCount: 88,
  },
  {
    id: "v-10",
    slug: "coffee-soi-61",
    shopName: "กาแฟซอย 61",
    description: "กาแฟเอสเปรสโซคั่วสด โฮมเมด มีโซนนั่งกลางแจ้ง",
    category: "DRINKS",
    phone: "081-777-3311",
    lineId: "@coffeesoi61",
    coverImageUrl: "",
    logoEmoji: "☕",
    latitude: jitter(MARKET_CENTER.lat, 80),
    longitude: jitter(MARKET_CENTER.lng, 80),
    boothNumber: "B-01",
    openTime: "07:00",
    closeTime: "20:00",
    openDays: openDaysAll,
    isActive: true,
    isVerified: true,
    rating: 4.6,
    reviewCount: 165,
    followerCount: 397,
  },
  {
    id: "v-11",
    slug: "accessory-corner",
    shopName: "มุมเครื่องประดับ",
    description: "ต่างหู กำไล แหวน สไตล์มินิมอล มีลายเฉพาะ",
    category: "ACCESSORIES",
    phone: "089-654-3100",
    coverImageUrl: "",
    logoEmoji: "💍",
    latitude: jitter(MARKET_CENTER.lat, 320),
    longitude: jitter(MARKET_CENTER.lng, 320),
    boothNumber: "F-02",
    openTime: "17:30",
    closeTime: "22:30",
    openDays: openDaysWeekend,
    isActive: true,
    isVerified: true,
    rating: 4.5,
    reviewCount: 99,
    followerCount: 215,
  },
  {
    id: "v-12",
    slug: "thai-tea-latte",
    shopName: "ชาไทยลาเต้",
    description: "ชาไทยเข้มข้น ชั้นนมเนียน ทำสด ๆ ทุกแก้ว",
    category: "DRINKS",
    phone: "098-000-1122",
    coverImageUrl: "",
    logoEmoji: "🧋",
    latitude: jitter(MARKET_CENTER.lat, 170),
    longitude: jitter(MARKET_CENTER.lng, 170),
    boothNumber: "B-08",
    openTime: "15:00",
    closeTime: "22:00",
    openDays: openDaysAll,
    isActive: true,
    isVerified: false,
    rating: 4.4,
    reviewCount: 61,
    followerCount: 132,
  },
];

export const PRODUCTS: Product[] = [
  { id: "p-01", vendorId: "v-01", name: "ก๋วยเตี๋ยวหมูน้ำตก", description: "เส้นเล็ก หมูชิ้นใหญ่ ซดคล่องคอ", imageEmoji: "🍜", regularPrice: 60, category: "noodle", isAvailable: true, tags: ["หมู", "เส้นเล็ก"] },
  { id: "p-02", vendorId: "v-01", name: "เกาเหลาต้มยำ", description: "ต้มยำหมูสับเข้มข้น", imageEmoji: "🥣", regularPrice: 70, category: "noodle", isAvailable: true, tags: ["ต้มยำ"] },
  { id: "p-03", vendorId: "v-02", name: "ทอดมันปลา 5 ชิ้น", description: "ปลาอินทรีแท้ เสิร์ฟกับน้ำจิ้มเต้าหู้", imageEmoji: "🍤", regularPrice: 70, category: "fried", isAvailable: true, tags: ["ทอด"] },
  { id: "p-04", vendorId: "v-02", name: "ลูกชิ้นทอด", description: "ลูกชิ้นหมูกรอบนอกเด้งใน", imageEmoji: "🍢", regularPrice: 40, category: "fried", isAvailable: true, tags: ["ทอด"] },
  { id: "p-05", vendorId: "v-03", name: "ชาไทยเย็น", description: "ชาไทยเข้มข้น ใส่น้ำแข็ง", imageEmoji: "🧋", regularPrice: 35, category: "tea", isAvailable: true, tags: ["ชา"] },
  { id: "p-06", vendorId: "v-03", name: "ชาเขียวมัทฉะ", description: "มัทฉะญี่ปุ่นแท้", imageEmoji: "🍵", regularPrice: 45, category: "tea", isAvailable: true, tags: ["ชา", "มัทฉะ"] },
  { id: "p-07", vendorId: "v-04", name: "ข้าวเหนียวมะม่วง", description: "มะม่วงน้ำดอกไม้ + ข้าวเหนียวมูล", imageEmoji: "🥭", regularPrice: 80, category: "dessert", isAvailable: true, tags: ["หวาน", "ผลไม้"] },
  { id: "p-08", vendorId: "v-05", name: "กะเพราหมูสับไข่ดาว", description: "เผ็ดร้อนแบบไทย ๆ พร้อมข้าวสวย", imageEmoji: "🍚", regularPrice: 55, category: "rice", isAvailable: true, tags: ["กะเพรา"] },
  { id: "p-09", vendorId: "v-06", name: "ตำไทยไข่เค็ม", description: "ตำไทยใส่ไข่เค็มหอมมัน", imageEmoji: "🥗", regularPrice: 60, category: "salad", isAvailable: true, tags: ["ส้มตำ"] },
  { id: "p-10", vendorId: "v-06", name: "ไก่ย่างครึ่งตัว", description: "ไก่บ้านหมักสมุนไพร ย่างสด ๆ", imageEmoji: "🍗", regularPrice: 140, category: "main", isAvailable: true, tags: ["ไก่"] },
  { id: "p-11", vendorId: "v-07", name: "แตงโมผลใหญ่", description: "แตงโมหวานฉ่ำ น้ำหนักประมาณ 3 กก.", imageEmoji: "🍉", regularPrice: 120, category: "fruit", isAvailable: true, tags: ["ผลไม้"] },
  { id: "p-12", vendorId: "v-08", name: "บิงซูสตรอว์เบอร์รี", description: "เนื้อน้ำแข็งเนียน โรยสตรอว์เบอร์รีสด", imageEmoji: "🍧", regularPrice: 150, category: "dessert", isAvailable: true, tags: ["หวาน"] },
  { id: "p-13", vendorId: "v-09", name: "เสื้อยืดโอเวอร์ไซส์", description: "ผ้าคอตตอน 100% สกรีนลายจำกัด", imageEmoji: "👕", regularPrice: 199, category: "cloth", isAvailable: true, tags: ["เสื้อ"] },
  { id: "p-14", vendorId: "v-10", name: "อเมริกาโน่เย็น", description: "เอสเปรสโซช็อตเข้ม น้ำแข็งเต็มแก้ว", imageEmoji: "☕", regularPrice: 50, category: "coffee", isAvailable: true, tags: ["กาแฟ"] },
  { id: "p-15", vendorId: "v-10", name: "ลาเต้ร้อน", description: "นมสตีมนุ่ม art บนแก้ว", imageEmoji: "☕", regularPrice: 55, category: "coffee", isAvailable: true, tags: ["กาแฟ"] },
  { id: "p-16", vendorId: "v-11", name: "ต่างหูเงินแท้", description: "ดีไซน์มินิมอล ใส่ได้ทุกวัน", imageEmoji: "💍", regularPrice: 250, category: "accessory", isAvailable: true, tags: ["เงิน"] },
  { id: "p-17", vendorId: "v-12", name: "ชาไทยลาเต้แก้วใหญ่", description: "ขนาด 24 ออนซ์ ได้ทั้งวัน", imageEmoji: "🥤", regularPrice: 59, category: "tea", isAvailable: true, tags: ["ชา"] },
];

/** Offset minutes from "now" for a deterministic-but-live feel */
function offsetFromNow(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

export const FLASH_SALES: FlashSale[] = [
  {
    id: "fs-01",
    vendorId: "v-01",
    title: "ก๋วยเตี๋ยวโปรหิวดึก",
    description: "สั่งก๋วยเตี๋ยวหมูน้ำตก ลดพิเศษช่วง 2 ทุ่ม",
    startAt: offsetFromNow(-20),
    endAt: offsetFromNow(45),
    status: "ACTIVE",
    items: [
      { productId: "p-01", salePrice: 45, stockLimit: 50, stockSold: 22 },
      { productId: "p-02", salePrice: 55, stockLimit: 30, stockSold: 11 },
    ],
  },
  {
    id: "fs-02",
    vendorId: "v-02",
    title: "ทอดมันลดหนัก",
    description: "ซื้อ 1 แถม 1 เฉพาะช่วง flash sale เท่านั้น",
    startAt: offsetFromNow(-8),
    endAt: offsetFromNow(35),
    status: "ACTIVE",
    items: [{ productId: "p-03", salePrice: 55, stockLimit: 60, stockSold: 30 }],
  },
  {
    id: "fs-03",
    vendorId: "v-03",
    title: "ชาเย็นรีเฟรชหน้าเลิกเรียน",
    description: "ชาไทยเย็น เหลือ 25 บาท 1 ชั่วโมงเท่านั้น",
    startAt: offsetFromNow(-35),
    endAt: offsetFromNow(20),
    status: "ACTIVE",
    items: [{ productId: "p-05", salePrice: 25, stockLimit: 100, stockSold: 58 }],
  },
  {
    id: "fs-04",
    vendorId: "v-04",
    title: "ข้าวเหนียวมะม่วงลดฟิน",
    description: "มะม่วงน้ำดอกไม้หวานฉ่ำ ลดเป็นพิเศษ",
    startAt: offsetFromNow(60),
    endAt: offsetFromNow(180),
    status: "SCHEDULED",
    items: [{ productId: "p-07", salePrice: 60, stockLimit: 40, stockSold: 0 }],
  },
  {
    id: "fs-05",
    vendorId: "v-06",
    title: "ส้มตำไข่เค็ม Happy Hour",
    description: "ส้มตำใส่ไข่เค็ม ลดราคาเฉพาะช่วง 5 โมงเย็น",
    startAt: offsetFromNow(-2),
    endAt: offsetFromNow(58),
    status: "ACTIVE",
    items: [{ productId: "p-09", salePrice: 49, stockLimit: 50, stockSold: 7 }],
  },
  {
    id: "fs-06",
    vendorId: "v-08",
    title: "บิงซูลด 20%",
    description: "บิงซูสตรอว์เบอร์รีเนื้อเนียน",
    startAt: offsetFromNow(-60),
    endAt: offsetFromNow(-15),
    status: "ENDED",
    items: [{ productId: "p-12", salePrice: 120, stockLimit: 30, stockSold: 30 }],
  },
  {
    id: "fs-07",
    vendorId: "v-10",
    title: "กาแฟเลิกเรียน",
    description: "อเมริกาโน่เย็น 35 บาท",
    startAt: offsetFromNow(-12),
    endAt: offsetFromNow(90),
    status: "ACTIVE",
    items: [{ productId: "p-14", salePrice: 35, stockLimit: 80, stockSold: 40 }],
  },
];

// Attach curated image URLs to every vendor + product.
for (const v of VENDORS) {
  const imgs = VENDOR_IMAGES[v.slug];
  if (imgs) {
    v.coverImageUrl = imgs.cover;
    v.logoUrl = imgs.logo;
  }
}
for (const p of PRODUCTS) {
  const img = PRODUCT_IMAGES[p.id];
  if (img) p.imageUrl = img;
}

export function vendorById(id: string): Vendor | undefined {
  return VENDORS.find((v) => v.id === id);
}

export function vendorBySlug(slug: string): Vendor | undefined {
  return VENDORS.find((v) => v.slug === slug);
}

export function productsOfVendor(vendorId: string): Product[] {
  return PRODUCTS.filter((p) => p.vendorId === vendorId);
}

export function productById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function flashSaleById(id: string): FlashSale | undefined {
  return FLASH_SALES.find((f) => f.id === id);
}

export function flashSalesForVendor(vendorId: string): FlashSale[] {
  return FLASH_SALES.filter((f) => f.vendorId === vendorId);
}

export function activeFlashSales(): FlashSale[] {
  return FLASH_SALES.filter((f) => f.status === "ACTIVE");
}

// ── Crowd forecast: deterministic synthetic series ─────────────────────────

function busyLevelFromCount(count: number, peak: number): BusyLevel {
  const ratio = count / peak;
  if (ratio < 0.2) return "VERY_QUIET";
  if (ratio < 0.4) return "QUIET";
  if (ratio < 0.6) return "MODERATE";
  if (ratio < 0.8) return "BUSY";
  if (ratio <= 1.0) return "VERY_BUSY";
  return "PEAK";
}

function hourlyShape(hour: number, dow: number): number {
  // Weekend (Fri=5,Sat=6,Sun=0) has heavier peaks
  const weekendBoost = dow === 5 || dow === 6 || dow === 0 ? 1.25 : 1.0;
  // Two peaks: lunch (~12) and dinner (~18-19)
  const lunch = Math.exp(-Math.pow(hour - 12, 2) / 4) * 60;
  const dinner = Math.exp(-Math.pow(hour - 18.5, 2) / 5) * 160;
  const base = hour >= 10 && hour <= 23 ? 20 : 4;
  return (base + lunch + dinner) * weekendBoost;
}

export function generateWeeklyForecast(now = new Date()): CrowdForecastPoint[] {
  const points: CrowdForecastPoint[] = [];
  const peak = 230;
  const rng = seeded(Math.floor(now.getTime() / (1000 * 60 * 60)));
  for (let h = 0; h < 168; h++) {
    const t = new Date(now.getTime() + h * 3600_000);
    const hour = t.getHours();
    const dow = t.getDay();
    const base = hourlyShape(hour, dow);
    const noise = (rng() - 0.5) * 16;
    const count = Math.max(0, Math.round(base + noise));
    const ciHalf = Math.max(5, Math.round(count * 0.18));
    points.push({
      time: t.toISOString(),
      count,
      lower: Math.max(0, count - ciHalf),
      upper: count + ciHalf,
      level: busyLevelFromCount(count, peak),
    });
  }
  return points;
}

export function bestTimesOnDate(
  points: CrowdForecastPoint[],
  date: Date,
  n = 3,
): CrowdForecastPoint[] {
  const day = new Date(date);
  const sameDay = points.filter((p) => {
    const d = new Date(p.time);
    return (
      d.getFullYear() === day.getFullYear() &&
      d.getMonth() === day.getMonth() &&
      d.getDate() === day.getDate() &&
      d.getHours() >= 10 &&
      d.getHours() <= 22
    );
  });
  return [...sameDay].sort((a, b) => a.count - b.count).slice(0, n);
}

export const DEMO_USERS = [
  { email: "student@kmutt.ac.th", role: "CUSTOMER" as const, name: "น้องนักศึกษา", password: "demo1234" },
  { email: "vendor@thungkhru.th", role: "VENDOR" as const, name: "ป้านวล", password: "demo1234", vendorId: "v-01" },
  { email: "admin@thungkhru.th", role: "ADMIN" as const, name: "แอดมินตลาด", password: "demo1234" },
];
