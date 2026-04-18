/**
 * Curated image URLs for the demo vendors + products.
 *
 * Product + shop cover images use Unsplash (CC0, commercial-use OK).
 * Shop logos use DiceBear avatars keyed by slug for deterministic uniqueness.
 *
 * If any Unsplash photo id ever 404s, the component layer falls back to the
 * vendor/product emoji so the UI never breaks.
 */

const UNSPLASH = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=75&auto=format&fit=crop`;

const DICEBEAR = (seed: string) =>
  `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundColor=C84B31,FFB84D,2D7D6E,E88770`;

export const VENDOR_IMAGES: Record<
  string,
  { cover: string; logo: string }
> = {
  "pa-nuan-noodle": {
    cover: UNSPLASH("1569562211093-4ed0d0758f12"), // thai noodle bowl
    logo: DICEBEAR("pa-nuan"),
  },
  "tod-man-pla-lek": {
    cover: UNSPLASH("1625220194771-7ebdea0b70b9"), // fried snacks
    logo: DICEBEAR("tod-man"),
  },
  "cha-yen-moma": {
    cover: UNSPLASH("1558857563-c0c6ee6ff8bb"), // thai tea glass
    logo: DICEBEAR("cha-yen"),
  },
  "mango-sticky-rice": {
    cover: UNSPLASH("1568158879083-c42860933ed7"), // mango sticky rice
    logo: DICEBEAR("mango"),
  },
  "phad-kra-pao": {
    cover: UNSPLASH("1559314809-0d155014e29e"), // thai basil chicken over rice
    logo: DICEBEAR("kra-pao"),
  },
  "som-tam-fai": {
    cover: UNSPLASH("1567620832903-9fc6debc209f"), // som tam papaya salad
    logo: DICEBEAR("som-tam"),
  },
  "fresh-fruits-papa": {
    cover: UNSPLASH("1610832958506-aa56368176cf"), // colorful fruit stall
    logo: DICEBEAR("fruits"),
  },
  "bingsu-kuma": {
    cover: UNSPLASH("1563805042-7684c019e1cb"), // bingsu shaved ice
    logo: DICEBEAR("bingsu"),
  },
  "tshirt-mommom": {
    cover: UNSPLASH("1523381210434-271e8be1f52b"), // tshirts hanging
    logo: DICEBEAR("tshirt"),
  },
  "coffee-soi-61": {
    cover: UNSPLASH("1501339847302-ac426a4a7cbb"), // coffee shop
    logo: DICEBEAR("coffee"),
  },
  "accessory-corner": {
    cover: UNSPLASH("1515562141207-7a88fb7ce338"), // jewelry flat lay
    logo: DICEBEAR("accessory"),
  },
  "thai-tea-latte": {
    cover: UNSPLASH("1544145945-f90425340c7e"), // thai iced tea
    logo: DICEBEAR("tea-latte"),
  },
};

export const PRODUCT_IMAGES: Record<string, string> = {
  "p-01": UNSPLASH("1569562211093-4ed0d0758f12", 600), // ก๋วยเตี๋ยวหมูน้ำตก
  "p-02": UNSPLASH("1547592180-85f173990554", 600),    // เกาเหลาต้มยำ
  "p-03": UNSPLASH("1604382354936-07c5d9983bd3", 600), // ทอดมันปลา 5 ชิ้น
  "p-04": UNSPLASH("1625220194771-7ebdea0b70b9", 600), // ลูกชิ้นทอด
  "p-05": UNSPLASH("1558857563-c0c6ee6ff8bb", 600),    // ชาไทยเย็น
  "p-06": UNSPLASH("1536256263959-770b48d82b0a", 600), // ชาเขียวมัทฉะ
  "p-07": UNSPLASH("1568158879083-c42860933ed7", 600), // ข้าวเหนียวมะม่วง
  "p-08": UNSPLASH("1559314809-0d155014e29e", 600),    // กะเพราหมูสับไข่ดาว
  "p-09": UNSPLASH("1567620832903-9fc6debc209f", 600), // ตำไทยไข่เค็ม
  "p-10": UNSPLASH("1598103442097-8b74394b95c6", 600), // ไก่ย่าง
  "p-11": UNSPLASH("1587049352846-4a222e784d38", 600), // แตงโม
  "p-12": UNSPLASH("1488477181946-6428a0291777", 600), // บิงซูสตรอว์เบอร์รี
  "p-13": UNSPLASH("1521572163474-6864f9cf17ab", 600), // เสื้อยืด
  "p-14": UNSPLASH("1461023058943-07fcbe16d735", 600), // อเมริกาโน่เย็น
  "p-15": UNSPLASH("1509042239860-f550ce710b93", 600), // ลาเต้ร้อน
  "p-16": UNSPLASH("1535632066927-ab7c9ab60908", 600), // ต่างหูเงิน
  "p-17": UNSPLASH("1544145945-f90425340c7e", 600),    // ชาไทยลาเต้แก้วใหญ่
};

export function productImage(productId: string): string | undefined {
  return PRODUCT_IMAGES[productId];
}

export function vendorImages(slug: string): { cover: string; logo: string } | undefined {
  return VENDOR_IMAGES[slug];
}
