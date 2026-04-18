# 🏪 ตลาดทุ่งครุ 61 - Sprint Plan

> **Project Codename:** ThungKhru61
> **Type:** Web Platform (PWA)
> **Target Users:** พ่อค้าแม่ค้าในตลาด + นักเรียน/นักศึกษาบริเวณใกล้เคียง (KMUTT, โรงเรียนทุ่งครุ, ฯลฯ)
> **Goal:** แพลตฟอร์มรวมร้านค้าตลาดทุ่งครุ 61 พร้อมระบบ Flash Sale แบบ real-time และแจ้งเตือนนักศึกษาที่อยู่ในรัศมีใกล้เคียง

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [Sprint Breakdown](#sprint-breakdown)
6. [API Design](#api-design)
7. [Design System](#design-system)
8. [Deployment & DevOps](#deployment--devops)
9. [Success Metrics](#success-metrics)
10. [Timeline](#timeline)

---

## Project Overview

### Problem Statement
- พ่อค้าแม่ค้าในตลาดทุ่งครุ 61 ไม่มีช่องทางโปรโมทสินค้า Flash Sale ให้ลูกค้ารู้แบบ real-time
- นักศึกษา KMUTT และโรงเรียนใกล้เคียงมักพลาดดีลดี ๆ เพราะไม่รู้ว่าร้านไหนลดราคาอยู่
- ไม่มีแผนที่กลางของตลาดที่บอกตำแหน่งร้านและราคาสินค้าชัดเจน

### Core Features
| Feature | Description | Priority |
|---------|-------------|----------|
| **Vendor Portal** | ร้านค้าลงทะเบียน จัดการสินค้า สร้าง flash sale | P0 |
| **Interactive Market Map** | แผนที่ตลาดแสดงตำแหน่งร้าน ราคา เมนูแนะนำ | P0 |
| **Flash Sale System** | ระบบลดราคาแบบจำกัดเวลา พร้อม countdown | P0 |
| **Proximity Alert** | แจ้งเตือนนักศึกษาที่อยู่ในรัศมีเมื่อมี flash sale | P0 |
| **Crowd Forecasting** | พยากรณ์จำนวนคนในตลาดรายชั่วโมง แสดง heatmap แนะนำช่วงเวลาที่ดีที่สุด | P0 |
| **Search & Filter** | ค้นหาร้าน/สินค้า กรองตามหมวดหมู่ ราคา ระยะทาง | P1 |
| **Favorites & Follow** | บันทึกร้านโปรด กดติดตามเพื่อรับ notification | P1 |
| **Reviews & Ratings** | รีวิวร้านและสินค้า | P2 |
| **Admin Dashboard** | จัดการผู้ใช้ ตรวจสอบร้านค้า ดู analytics | P1 |

### Non-Goals (สำหรับเวอร์ชันนี้)
- ระบบชำระเงินออนไลน์ (ใช้เงินสดที่ร้าน)
- ระบบ delivery
- Native mobile app (ทำเป็น PWA แทน)

---

## Tech Stack

### Frontend
```
Framework:        Next.js 15 (App Router) + TypeScript
Styling:          Tailwind CSS + shadcn/ui
State:            Zustand (client state) + TanStack Query (server state)
Forms:            React Hook Form + Zod validation
Maps:             Mapbox GL JS (หรือ Leaflet + OpenStreetMap ถ้าต้องการฟรี)
Animation:        Framer Motion
Icons:            Lucide React
PWA:              next-pwa + Workbox
Notifications:    Web Push API + service worker
```

### Backend
```
Runtime:          Next.js API Routes + Route Handlers
Database:         PostgreSQL (via Supabase) + PostGIS + TimescaleDB extension
ORM:              Prisma
Auth:             Supabase Auth (email + phone OTP)
Storage:          Supabase Storage (รูปสินค้า รูปร้าน)
Realtime:         Supabase Realtime (flash sale updates)
Background Jobs:  Vercel Cron + Supabase Edge Functions
Push Service:     Firebase Cloud Messaging (FCM) หรือ Web Push
```

### ML / Forecasting Service
```
Service:          FastAPI microservice (deploy บน Railway / Fly.io / AWS Lambda)
Models:           LightGBM (main) + Prophet (baseline) + optional LSTM
Feature Store:    Postgres + Redis cache
Training:         APScheduler / Celery daily retrain
Libraries:        pandas, scikit-learn, lightgbm, prophet, holidays (TH)
Serving:          ONNX Runtime (fast inference) + FastAPI /predict endpoint
Experiment Track: MLflow (self-hosted) หรือ Weights & Biases
```

### DevOps & Tooling
```
Hosting:          Vercel (frontend) + Supabase (backend)
CI/CD:            GitHub Actions
Monitoring:       Sentry + Vercel Analytics
Testing:          Vitest + Playwright
Linting:          ESLint + Prettier + Husky
Package Manager:  pnpm
```

### Why this stack?
- **Next.js 15** — Server Components ลด JS bundle, SSR เร็ว SEO ดี
- **Supabase** — all-in-one (DB + Auth + Storage + Realtime) ลดเวลา setup, region สิงคโปร์ใกล้ไทย
- **Mapbox** — custom styling สวย รองรับ clustering markers จำนวนมาก (ถ้างบจำกัดใช้ Leaflet)
- **PWA** — ผู้ใช้ติดตั้งลงหน้าจอมือถือได้โดยไม่ต้องผ่าน App Store รองรับ push notification

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Client (PWA)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Vendor Panel │  │ Customer App │  │ Admin Dashboard    │  │
│  └──────────────┘  └──────────────┘  └────────────────────┘  │
│                    Next.js 15 (App Router)                   │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTPS / WSS
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                    Next.js API Layer (Vercel)                │
│   Auth Guard • Rate Limit • Input Validation • Caching       │
└────────────────────────────┬─────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┬─────────────────┐
        ▼                    ▼                    ▼                 ▼
  ┌───────────┐       ┌────────────┐       ┌────────────┐   ┌──────────────┐
  │ Supabase  │       │  Mapbox    │       │   FCM /    │   │ Forecast API │
  │ Postgres  │       │  Tiles API │       │  Web Push  │   │   (FastAPI)  │
  │ + PostGIS │       └────────────┘       └────────────┘   │  LightGBM +  │
  │ + Timescl │                                             │   Prophet    │
  │ + Auth    │                                             └──────┬───────┘
  │ + Storage │                                                    │
  │ + Realtime│                                                    │
  └─────┬─────┘                                                    │
        │                                                          │
        ▼                                                          │
  ┌───────────────────────┐         ┌───────────────────────┐      │
  │ Edge Functions        │         │ Feature Store         │◀─────┘
  │ - Geofence Matcher    │         │ (materialized views + │
  │ - Flash Sale Notifier │         │  Redis cache)         │
  │ - Image Optimizer     │         └───────────────────────┘
  │ - Crowd Logger        │
  └───────────────────────┘
```

### Data Flow: Flash Sale Alert
```
1. Vendor สร้าง flash sale → Insert row ใน flash_sales
2. DB trigger → Supabase Edge Function "notifyNearbyUsers"
3. Function ดึง user_locations ที่อยู่ในรัศมี 500m - 2km
4. ส่ง push notification ผ่าน FCM/Web Push
5. Realtime channel broadcast ให้ทุก client ที่เปิดแอปอยู่
6. Client แสดง banner + badge + sound
```

### Data Flow: Crowd Forecasting
```
[Data Collection — ต่อเนื่อง]
1. App ping ตำแหน่ง user → Edge Function "crowdLogger" → insert crowd_data_points
2. Vendor กด "คนเยอะตอนนี้" → เพิ่ม signal strength
3. Check-in (scan QR ที่ตลาด) → gold-standard ground truth
4. Scrape weather API (OpenWeather) → weather_snapshots
5. Holiday calendar (TH) → อัปเดตทุกวัน

[Training — daily 03:00]
6. Aggregate เป็น hourly bucket → features: hour, dow, is_holiday, weather, events, flash_sale_count
7. Train LightGBM (168-hour ahead forecast) → save model ไป MLflow registry
8. Validate: MAE < 15 people, MAPE < 20% ถึงจะ promote ไป production

[Serving — realtime]
9. Client ขอ /forecast?from=now&hours=168 → FastAPI
10. Load model + features จาก feature store → predict
11. Return JSON: [{hour, predicted_count, confidence_lower, confidence_upper}]
12. Frontend render heatmap / line chart / "best time" badge
```

---

## Database Schema

### Core Tables (Prisma schema)

```prisma
// User & Auth
model User {
  id            String    @id @default(uuid())
  email         String?   @unique
  phone         String?   @unique
  displayName   String
  avatarUrl     String?
  role          UserRole  @default(CUSTOMER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  vendor        Vendor?
  favorites     Favorite[]
  follows       Follow[]
  reviews       Review[]
  locations     UserLocation[]
  deviceTokens  DeviceToken[]
}

enum UserRole {
  CUSTOMER
  VENDOR
  ADMIN
}

// Vendor Shop
model Vendor {
  id            String    @id @default(uuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id])
  shopName      String
  slug          String    @unique
  description   String?
  category      ShopCategory
  phone         String
  lineId        String?
  coverImageUrl String?
  logoUrl       String?

  // Location
  latitude      Float
  longitude     Float
  boothNumber   String?   // เลขล็อกในตลาด เช่น A-12
  address       String?

  // Operating hours
  openTime      String?   // "17:00"
  closeTime     String?   // "23:00"
  openDays      String[]  // ["mon","tue","wed"]

  isActive      Boolean   @default(true)
  isVerified    Boolean   @default(false)
  rating        Float     @default(0)
  reviewCount   Int       @default(0)

  products      Product[]
  flashSales    FlashSale[]
  followers     Follow[]
  reviews       Review[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([latitude, longitude])
  @@index([category])
}

enum ShopCategory {
  FOOD_STREET       // อาหารทานเล่น
  FOOD_MAIN         // อาหารจานหลัก
  DRINKS            // เครื่องดื่ม
  DESSERTS          // ของหวาน
  FRUITS            // ผลไม้
  CLOTHES           // เสื้อผ้า
  ACCESSORIES       // เครื่องประดับ
  COSMETICS         // เครื่องสำอาง
  GROCERIES         // ของชำ
  OTHER
}

// Product
model Product {
  id            String    @id @default(uuid())
  vendorId      String
  vendor        Vendor    @relation(fields: [vendorId], references: [id])
  name          String
  description   String?
  imageUrl      String?
  regularPrice  Decimal   @db.Decimal(10, 2)
  category      String?
  isAvailable   Boolean   @default(true)
  tags          String[]

  flashSales    FlashSaleItem[]
  favorites     Favorite[]
  reviews       Review[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([vendorId])
}

// Flash Sale
model FlashSale {
  id            String    @id @default(uuid())
  vendorId      String
  vendor        Vendor    @relation(fields: [vendorId], references: [id])
  title         String
  description   String?
  startAt       DateTime
  endAt         DateTime
  status        FlashSaleStatus @default(SCHEDULED)

  items         FlashSaleItem[]
  notifiedUserIds String[] // ป้องกันแจ้งเตือนซ้ำ

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([status, startAt, endAt])
}

enum FlashSaleStatus {
  SCHEDULED
  ACTIVE
  ENDED
  CANCELLED
}

model FlashSaleItem {
  id            String    @id @default(uuid())
  flashSaleId   String
  flashSale     FlashSale @relation(fields: [flashSaleId], references: [id], onDelete: Cascade)
  productId     String
  product       Product   @relation(fields: [productId], references: [id])
  salePrice     Decimal   @db.Decimal(10, 2)
  stockLimit    Int?      // จำกัดจำนวน null = ไม่จำกัด
  stockSold     Int       @default(0)

  @@unique([flashSaleId, productId])
}

// User Location & Geofencing
model UserLocation {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  latitude      Float
  longitude     Float
  accuracy      Float?
  isOptedIn     Boolean   @default(true)
  updatedAt     DateTime  @updatedAt

  @@unique([userId])
  @@index([latitude, longitude])
}

// Device token สำหรับ push notification
model DeviceToken {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  token         String    @unique
  platform      String    // "web" | "ios" | "android"
  endpoint      String?   // สำหรับ Web Push
  keys          Json?     // p256dh, auth keys สำหรับ Web Push
  createdAt     DateTime  @default(now())
  lastUsedAt    DateTime  @default(now())
}

// Follow / Favorite
model Follow {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  vendorId  String
  vendor    Vendor   @relation(fields: [vendorId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, vendorId])
}

model Favorite {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, productId])
}

// Review
model Review {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  vendorId  String?
  vendor    Vendor?  @relation(fields: [vendorId], references: [id])
  productId String?
  product   Product? @relation(fields: [productId], references: [id])
  rating    Int      // 1-5
  comment   String?
  imageUrls String[]
  createdAt DateTime @default(now())

  @@index([vendorId])
  @@index([productId])
}

// Notification log (audit trail)
model NotificationLog {
  id          String    @id @default(uuid())
  userId      String
  type        String    // "flash_sale" | "vendor_update" | "proximity" | "crowd_alert"
  title       String
  body        String
  payload     Json?
  sentAt      DateTime  @default(now())
  readAt      DateTime?
  clickedAt   DateTime?

  @@index([userId, sentAt])
}

// ═══════════════════════════════════════════════════
// Crowd Forecasting System
// ═══════════════════════════════════════════════════

// Raw data point - เก็บทุก signal ที่บอกว่ามีคนอยู่ใน/ใกล้ตลาด
// ใช้ TimescaleDB hypertable สำหรับ time-series performance
model CrowdDataPoint {
  id            String    @id @default(uuid())
  timestamp     DateTime  @default(now())
  source        CrowdSource
  signalWeight  Float     @default(1.0)  // น้ำหนัก signal (check-in=5, app-open=1, vendor-report=3)

  // ตำแหน่งและระยะห่างจากศูนย์กลางตลาด
  latitude      Float?
  longitude     Float?
  distanceM     Float?    // ระยะห่างจากศูนย์กลาง (meter)
  inMarket      Boolean   @default(false) // อยู่ในขอบเขตตลาดหรือไม่

  userId        String?   // null ถ้าเป็น anonymous
  vendorId      String?   // ถ้า signal มาจาก vendor

  metadata      Json?

  @@index([timestamp])
  @@index([inMarket, timestamp])
}

enum CrowdSource {
  APP_OPEN_NEARBY      // user เปิดแอปขณะอยู่ในรัศมี 500m
  GEOFENCE_ENTER       // เข้าเขต geofence ตลาด
  GEOFENCE_EXIT        // ออกจากเขต
  QR_CHECKIN           // สแกน QR code ที่ตลาด (ground truth ดีที่สุด)
  VENDOR_REPORT_BUSY   // vendor รายงาน "คนเยอะตอนนี้"
  VENDOR_REPORT_QUIET  // vendor รายงาน "คนน้อยตอนนี้"
  FLASH_SALE_VIEW      // ดู flash sale (สัญญาณความสนใจ)
  MANUAL_ESTIMATE      // admin กรอกประมาณการ
}

// Aggregate รายชั่วโมง - precomputed สำหรับ model training และ display
model CrowdHourlySnapshot {
  id                String    @id @default(uuid())
  bucketStart       DateTime  // จุดเริ่มของ hour เช่น 2026-04-18 18:00:00
  estimatedCount    Int       // จำนวนคนประมาณการ (จาก weighted signals)
  rawSignalCount    Int       // จำนวน signal ดิบ
  uniqueUsers       Int       // user ที่ unique ในชั่วโมงนั้น

  // Features ที่ใช้ train model
  dayOfWeek         Int       // 0-6
  hourOfDay         Int       // 0-23
  isHoliday         Boolean   @default(false)
  isRaining         Boolean   @default(false)
  temperatureC      Float?
  activeFlashSales  Int       @default(0)
  activeVendors     Int       @default(0)

  createdAt         DateTime  @default(now())

  @@unique([bucketStart])
  @@index([dayOfWeek, hourOfDay])
}

// Forecast output - เก็บผลพยากรณ์ล่วงหน้า 7 วัน (168 ชั่วโมง)
model CrowdForecast {
  id                String    @id @default(uuid())
  targetTime        DateTime  // เวลาที่พยากรณ์
  predictedCount    Int
  confidenceLower   Int       // 10th percentile
  confidenceUpper   Int       // 90th percentile
  busyLevel         BusyLevel
  modelVersion      String    // track ว่าใช้ model ไหน
  generatedAt       DateTime  @default(now())

  @@unique([targetTime, modelVersion])
  @@index([targetTime])
}

enum BusyLevel {
  VERY_QUIET    // < 20% ของ peak
  QUIET         // 20-40%
  MODERATE      // 40-60%
  BUSY          // 60-80%
  VERY_BUSY     // 80-100%
  PEAK          // > 100% ของ average peak
}

// Ground truth จาก QR check-in (ใช้เป็น validation set)
model CheckIn {
  id          String    @id @default(uuid())
  userId      String?
  checkpointId String   // QR code แต่ละจุดในตลาด
  timestamp   DateTime  @default(now())

  @@index([timestamp])
  @@index([checkpointId, timestamp])
}

// Weather snapshot - cache จาก OpenWeather API
model WeatherSnapshot {
  id            String   @id @default(uuid())
  timestamp     DateTime @unique
  temperatureC  Float
  humidity      Float
  rainMm        Float    @default(0)
  condition     String   // "clear" | "clouds" | "rain" | "thunderstorm"
  windKph       Float?

  @@index([timestamp])
}

// Model registry - track experiments
model ForecastModel {
  id            String   @id @default(uuid())
  version       String   @unique
  algorithm     String   // "lightgbm" | "prophet" | "lstm" | "ensemble"
  mae           Float    // Mean Absolute Error
  mape          Float    // Mean Absolute Percentage Error
  rmse          Float
  trainedAt     DateTime @default(now())
  isActive      Boolean  @default(false)
  hyperparams   Json?
  featureList   String[]
  notes         String?
}
```

### Row Level Security (RLS) Policies
- `vendors` — public read, vendor เจ้าของ row เขียนได้เฉพาะของตัวเอง
- `products` — public read, vendor เขียนได้เฉพาะของร้านตัวเอง
- `user_locations` — user อ่าน/เขียนได้เฉพาะของตัวเอง, edge function อ่านได้ทั้งหมด (service_role)
- `reviews` — public read, user เขียนรีวิวของตัวเองได้เท่านั้น

---

## Sprint Breakdown

> **ระยะเวลาโครงการ:** 9 สัปดาห์ (9 sprints, sprint ละ 1 สัปดาห์)
> **Team Assumption:** 1-2 นักพัฒนา + 1 ML engineer part-time (ใช้ Claude Code ช่วย)

---

### 🏗️ Sprint 0 — Foundation & Setup (Week 1)

**เป้าหมาย:** วางรากฐานโครงการให้พร้อมเขียน feature

**Tasks**
- [ ] สร้าง Next.js 15 project + TypeScript + Tailwind
- [ ] Setup shadcn/ui component library + theme
- [ ] Config ESLint, Prettier, Husky, lint-staged
- [ ] สร้างโปรเจกต์ Supabase (region: Singapore)
- [ ] Setup Prisma + migration แรก (schema.prisma ตามด้านบน)
- [ ] Config Supabase Auth (email + phone OTP ผ่าน SMS provider)
- [ ] Setup folder structure: `app/`, `components/`, `lib/`, `hooks/`, `types/`
- [ ] Create `CLAUDE.md` สำหรับ context & workflow
- [ ] Setup Git repo + GitHub Actions CI (lint + typecheck + test)
- [ ] Config environment variables (`.env.example`, Vercel env)
- [ ] Deploy skeleton ไป Vercel preview

**Folder Structure**
```
thungkhru61/
├── app/
│   ├── (public)/              # หน้าที่ไม่ต้อง login
│   │   ├── page.tsx           # หน้าแรก แสดงแผนที่
│   │   ├── shops/
│   │   ├── products/
│   │   └── flash-sales/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── vendor/                # Vendor panel (protected)
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── flash-sales/
│   │   └── profile/
│   ├── admin/                 # Admin (protected)
│   └── api/
├── components/
│   ├── ui/                    # shadcn components
│   ├── map/                   # MapContainer, ShopMarker, MapControls
│   ├── vendor/
│   ├── flash-sale/
│   └── layout/
├── lib/
│   ├── supabase/              # client + server helpers
│   ├── prisma.ts
│   ├── geo.ts                 # distance calc, geofence
│   ├── push.ts                # push notification helpers
│   └── utils.ts
├── hooks/
├── types/
└── public/
```

**Acceptance Criteria**
- รัน `pnpm dev` แล้วเห็นหน้าแรกที่ deploy บน Vercel
- DB connection ผ่าน Prisma ทำงานได้
- CI pipeline เขียว

---

### 🔐 Sprint 1 — Authentication & User Profile (Week 2)

**เป้าหมาย:** ผู้ใช้สมัครสมาชิก เข้าสู่ระบบ แก้โปรไฟล์ได้ รองรับ 3 role

**Tasks**
- [ ] หน้าสมัครสมาชิก / เข้าสู่ระบบ (email + password + phone OTP)
- [ ] Middleware ตรวจ session ใน server component
- [ ] `<AuthGuard>` HOC สำหรับ protect route ตาม role
- [ ] เลือก role ตอนสมัคร: นักศึกษา/ลูกค้า หรือ พ่อค้าแม่ค้า
- [ ] หน้าแก้ไขโปรไฟล์ (ชื่อ, avatar, เบอร์โทร)
- [ ] Phone OTP verification ผ่าน Supabase SMS
- [ ] Reset password flow
- [ ] Logout
- [ ] Unit test สำหรับ auth helpers

**User Flows**
```
Guest → /register
       → เลือก role
       → กรอก email + phone
       → รับ OTP → ยืนยัน
       → redirect ไป /vendor/onboarding หรือ /
```

**API Endpoints**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/verify-otp
POST   /api/auth/logout
GET    /api/user/me
PATCH  /api/user/me
```

**Acceptance Criteria**
- Login/Register/Logout ทำงานครบทุก role
- OTP ส่งเข้าเบอร์จริงได้
- หน้าที่ต้อง auth จะ redirect ไป `/login` ถ้าไม่ได้ login
- Session หมดอายุแล้ว refresh token ทำงาน

---

### 🏪 Sprint 2 — Vendor Shop Management (Week 3)

**เป้าหมาย:** พ่อค้าแม่ค้าสร้างร้าน จัดการข้อมูลร้าน เปิด-ปิดร้านได้

**Tasks**
- [ ] หน้า Vendor Onboarding (3 steps: ข้อมูลร้าน / ตำแหน่ง / เวลาเปิด-ปิด)
- [ ] Upload รูปร้าน + logo (Supabase Storage + image optimization)
- [ ] ปักหมุดตำแหน่งร้านบนแผนที่ (drag marker)
- [ ] เลือกเลขล็อก (booth number) dropdown
- [ ] เลือกวันและเวลาเปิด-ปิด
- [ ] หน้า Vendor Dashboard แสดง summary
- [ ] แก้ไขข้อมูลร้าน
- [ ] เปิด/ปิดร้านชั่วคราว (toggle `isActive`)
- [ ] Admin approval flow (`isVerified` เริ่มต้นเป็น false, admin อนุมัติ)

**Pages**
```
/vendor/onboarding         # หลัง register ครั้งแรก
/vendor/dashboard          # overview (sales today, views, followers)
/vendor/profile            # แก้ไขข้อมูลร้าน
/vendor/settings
```

**API Endpoints**
```
POST   /api/vendor          # create shop
GET    /api/vendor/me       # my shop info
PATCH  /api/vendor/me
POST   /api/vendor/toggle-open
POST   /api/upload          # presigned URL สำหรับ Supabase Storage
```

**Components**
- `<ShopForm>` — ฟอร์มข้อมูลร้าน พร้อม Zod validation
- `<LocationPicker>` — Mapbox เล็ก ๆ ให้ drag pin ตั้งตำแหน่ง
- `<ImageUploader>` — drag & drop + preview + resize
- `<OperatingHoursPicker>` — เลือกวัน+เวลา

**Acceptance Criteria**
- Vendor ลงทะเบียนร้านเสร็จภายใน 3 นาที
- รูปอัปโหลดแล้ว optimize อัตโนมัติ (WebP, < 200KB)
- ตำแหน่งบันทึก lat/lng ถูกต้อง (ตรวจด้วย Google Maps)

---

### 🛒 Sprint 3 — Product Catalog & Flash Sale (Week 4)

**เป้าหมาย:** Vendor เพิ่มสินค้า สร้าง flash sale ลูกค้าเห็น flash sale ที่ active

**Tasks**
- [ ] หน้าจัดการสินค้า (list + create + edit + delete)
- [ ] Bulk upload ผ่าน CSV (optional)
- [ ] Flash Sale Wizard: เลือกสินค้า → ตั้งราคา → กำหนดเวลา → preview → publish
- [ ] Countdown timer component
- [ ] Cron job เปลี่ยน status `SCHEDULED → ACTIVE → ENDED` อัตโนมัติ
- [ ] หน้า public `/flash-sales` แสดง flash sale ที่ active
- [ ] Sort by: ending soon, discount %, distance
- [ ] `/flash-sales/[id]` รายละเอียดรวมข้อมูลร้าน
- [ ] Realtime update ด้วย Supabase Realtime channel `flash_sales:active`
- [ ] Limit stock: ถ้า `stockSold >= stockLimit` จะไม่แสดง

**Business Rules**
- Flash sale ต้องมีระยะเวลาอย่างน้อย 15 นาที ไม่เกิน 6 ชั่วโมง
- Sale price ต้องน้อยกว่า regular price อย่างน้อย 10%
- Vendor สร้าง flash sale ที่ซ้อนทับเวลากันไม่ได้

**Components**
- `<ProductCard>` — รูป + ชื่อ + ราคา + badge "FLASH SALE"
- `<FlashSaleCountdown>` — แสดง hh:mm:ss นับถอยหลัง
- `<FlashSaleBanner>` — banner ใหญ่บนหน้าแรก
- `<DiscountBadge>` — แสดง % ส่วนลด

**API Endpoints**
```
GET    /api/products?vendorId=
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id

GET    /api/flash-sales?status=active&near=lat,lng&radius=2000
POST   /api/flash-sales
PATCH  /api/flash-sales/:id
POST   /api/flash-sales/:id/cancel
```

**Acceptance Criteria**
- Vendor สร้าง flash sale 10 รายการ ใช้เวลาไม่เกิน 5 นาที
- ลูกค้าเห็น countdown update ทุก 1 วินาที
- ถึงเวลาเริ่ม/จบ status เปลี่ยนอัตโนมัติไม่เกิน 60 วินาที
- Realtime: vendor update ราคา → user เห็นทันทีโดยไม่ต้องรีเฟรช

---

### 🗺️ Sprint 4 — Interactive Market Map (Week 5)

**เป้าหมาย:** แผนที่ตลาดแสดงร้านทั้งหมด มีหมุดคลิกดูรายละเอียด กรองได้

**Tasks**
- [ ] Integrate Mapbox GL JS (หรือ Leaflet ถ้างบจำกัด)
- [ ] Custom map style สำหรับตลาด (สีโทนอุ่น minimal)
- [ ] Markers แยกสี/ไอคอนตาม category
- [ ] Marker clustering เมื่อ zoom ออก
- [ ] Click marker → popup card (รูป, ชื่อร้าน, rating, flash sale badge)
- [ ] ปุ่ม "ดูร้าน" → navigate ไป `/shops/[slug]`
- [ ] Geolocation: แสดงตำแหน่งผู้ใช้ + ปุ่ม "ไปยังร้าน" (เปิด Google Maps directions)
- [ ] Filter panel: category, มี flash sale, ระยะทาง, เปิดอยู่ตอนนี้
- [ ] Search bar: ค้นหาชื่อร้าน/สินค้า
- [ ] Heatmap mode: แสดงจุดที่มี flash sale เยอะ
- [ ] Map bound สำหรับตลาดทุ่งครุ 61 (จำกัดโซน zoom)

**Responsive Design**
- **Mobile:** แผนที่เต็มจอ + bottom sheet แสดงร้านรอบ ๆ (Uber-style)
- **Tablet:** แผนที่ซ้าย 60% + รายการร้านขวา 40%
- **Desktop:** แผนที่ขนาดใหญ่ตรงกลาง + side panel ซ้าย-ขวา

**Performance Targets**
- First marker appear < 2s
- Smooth pan/zoom at 60fps
- Cluster rendering สำหรับร้าน 500+ ร้าน ไม่ lag

**Components**
- `<MapContainer>` — wrapper หลัก
- `<ShopMarker>` — custom marker ตาม category
- `<MapControls>` — zoom, compass, my location
- `<FilterDrawer>` — bottom sheet บนมือถือ
- `<ShopBottomSheet>` — Uber-style rail

**Acceptance Criteria**
- โหลดครั้งแรกเห็นแผนที่ตลาดพร้อมหมุด < 3 วินาที
- Filter ทำงานแบบ realtime ไม่ reload หน้า
- รองรับ 500+ markers ผ่าน clustering
- "ไปยังร้าน" เปิด Google Maps ด้วย intent deep link

---

### 🔔 Sprint 5 — Alert & Push Notification System (Week 6)

**เป้าหมาย:** นักศึกษาที่อยู่ใกล้ตลาดได้รับ push notification เมื่อมี flash sale

**Tasks**
- [ ] Service Worker + Web Push registration
- [ ] ขอ permission สำหรับ location + notification (UX ที่ดี ไม่ขอทันที)
- [ ] บันทึก device token ลง DB
- [ ] Background location update (periodic, battery-friendly)
- [ ] Edge Function: `notifyNearbyUsers`
  - ทำงานเมื่อ flash sale status → ACTIVE
  - Query user ที่ `isOptedIn = true` และอยู่ในรัศมี 2km (Haversine formula หรือ PostGIS)
  - กรอง user ที่ปิด notification สำหรับหมวดนี้
  - ส่ง push ผ่าน FCM/Web Push
  - บันทึก `NotificationLog`
- [ ] Notification preference page
  - เปิด/ปิดทั้งหมด
  - เลือก category ที่สนใจ
  - กำหนดรัศมี (500m / 1km / 2km / 5km)
  - Quiet hours (เช่น 23:00 - 07:00)
- [ ] In-app notification center (bell icon + badge)
- [ ] Click notification → deep link ไปหน้า flash sale นั้น
- [ ] Email fallback สำหรับคนที่ปิด push

**Geofence Strategy**
```typescript
// ใช้ PostGIS extension ใน Postgres
CREATE EXTENSION postgis;

ALTER TABLE user_locations
  ADD COLUMN geom geography(Point, 4326)
  GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
  ) STORED;

CREATE INDEX idx_user_locations_geom ON user_locations USING GIST (geom);

// Query หา user ใกล้ flash sale
SELECT u.id, u.display_name, dt.token
FROM user_locations ul
JOIN users u ON u.id = ul.user_id
JOIN device_tokens dt ON dt.user_id = u.id
WHERE ul.is_opted_in = true
  AND ST_DWithin(
    ul.geom,
    ST_SetSRID(ST_MakePoint($vendorLng, $vendorLat), 4326)::geography,
    $radiusMeters
  );
```

**Anti-spam Rules**
- User คนเดียวรับแจ้งเตือน flash sale สูงสุด 5 ครั้ง/ชั่วโมง
- Flash sale เดิมไม่แจ้งซ้ำ (ตรวจ `notifiedUserIds`)
- Rate limit: 1 notification / user / 10 นาที

**Components**
- `<PermissionPrompt>` — ขอ permission แบบ contextual
- `<NotificationBell>` — icon + badge + dropdown
- `<NotificationPreferences>` — หน้าตั้งค่า

**Acceptance Criteria**
- User อยู่ในรัศมี 1km จากตลาด → ได้ push ภายใน 30 วินาที หลัง flash sale เริ่ม
- ปิด notification แล้วไม่ได้รับอีก
- Notification มีรูป + countdown ให้คลิกไปหน้า flash sale ได้

---

### 🔍 Sprint 6 — Search, Discovery & Social Features (Week 7)

**เป้าหมาย:** ค้นหา/ค้นพบร้านและสินค้า ระบบ follow + favorite + review

**Tasks**
- [ ] Full-text search (Postgres `tsvector` สำหรับไทย)
- [ ] Autocomplete ขณะพิมพ์ (debounce 300ms)
- [ ] Trending section หน้าแรก: ร้านใหม่, รีวิวเยอะ, flash sale วันนี้
- [ ] Follow/Unfollow ร้าน
- [ ] Favorite product
- [ ] หน้า "ร้านที่ติดตาม" + feed ของร้านที่ follow
- [ ] Review system: rating 1-5, comment, รูป
- [ ] Vendor ตอบรีวิวได้
- [ ] Report review (สำหรับ admin review)
- [ ] Share link ร้าน/สินค้า (OG meta tags)

**Search Features**
- ค้นหาภาษาไทย thai-word-segmentation (pythainlp ถ้าจำเป็น หรือใช้ pg_trgm)
- Filter: category, ราคา, ระยะทาง, rating
- Sort: relevance, ใกล้ที่สุด, ราคาต่ำ-สูง, rating สูง
- Recent searches + suggested searches

**Components**
- `<SearchBar>` — พร้อม autocomplete
- `<FilterChips>` — toggleable chips
- `<ReviewCard>` + `<ReviewForm>`
- `<FollowButton>` — optimistic update
- `<ShopFeed>` — timeline ร้านที่ follow

**API Endpoints**
```
GET    /api/search?q=&category=&near=&sort=
GET    /api/discover/trending
POST   /api/follows
DELETE /api/follows/:vendorId
POST   /api/favorites
POST   /api/reviews
GET    /api/feed
```

**Acceptance Criteria**
- ค้นหา "ส้มตำ" ได้ผลลัพธ์จากชื่อร้าน ชื่อสินค้า และ tags
- Follow ร้าน 1 คลิก เห็น feed ของร้านนั้นใน `/feed`
- Review แสดงผลทันทีหลังโพสต์ (optimistic)

---

### 📊 Sprint 7 — Crowd Forecasting System (Week 8)

**เป้าหมาย:** ระบบพยากรณ์จำนวนคนในตลาดรายชั่วโมงล่วงหน้า 7 วัน แสดง heatmap + "best time to visit" + vendor insights

**Problem เจาะจง**
- นักศึกษาอยากรู้ว่าจะไปตลาดตอนไหนไม่ต้องแน่น ไม่ต้องต่อแถวนาน
- Vendor อยากรู้ช่วงเวลาที่คนมากที่สุดเพื่อเตรียมของและปล่อย flash sale ให้ตรงจุด
- Admin อยากรู้ว่าควรจัด event วันไหน เวลาไหน

#### 7.1 Data Collection Layer

**Tasks**
- [ ] Enable TimescaleDB extension บน Postgres (ถ้าใช้ Supabase ต้องเปิดใน extensions)
- [ ] สร้าง hypertable สำหรับ `crowd_data_points`
- [ ] Edge Function `crowdLogger` รับ signal จาก client
  - App open + location → weight 1.0
  - Geofence enter/exit → weight 2.0
  - QR check-in → weight 5.0 (ground truth)
  - Vendor report → weight 3.0
  - Flash sale view → weight 0.5
- [ ] Privacy: ไม่เก็บ userId ถ้า user เลือก opt-out, ใช้ anonymous session id
- [ ] Vendor button "รายงานความหนาแน่น" ใน dashboard (busy/normal/quiet)
- [ ] QR check-in checkpoint (พิมพ์โปสเตอร์ QR ไว้ 3-5 จุดในตลาด)
- [ ] Cron job ทุก 15 นาที: scrape OpenWeather API → บันทึก weather snapshot
- [ ] Cron job รายวัน: aggregate `crowd_data_points` → `crowd_hourly_snapshots`
- [ ] Seed ข้อมูลย้อนหลัง 4 สัปดาห์ จาก vendor survey + manual estimate

**SQL - TimescaleDB Setup**
```sql
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Convert to hypertable
SELECT create_hypertable(
  'crowd_data_points',
  'timestamp',
  chunk_time_interval => INTERVAL '1 day'
);

-- Continuous aggregate (auto-refresh)
CREATE MATERIALIZED VIEW crowd_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', timestamp) AS bucket,
  COUNT(DISTINCT user_id) AS unique_users,
  SUM(signal_weight) AS weighted_count,
  COUNT(*) AS raw_count
FROM crowd_data_points
WHERE in_market = true
GROUP BY bucket;

-- Refresh policy
SELECT add_continuous_aggregate_policy('crowd_hourly',
  start_offset => INTERVAL '3 hours',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '30 minutes');
```

#### 7.2 ML Training Pipeline

**Tasks**
- [ ] สร้าง FastAPI microservice project `forecast-service/`
- [ ] Data loader: ดึง `crowd_hourly_snapshots` + join weather + flash sale count
- [ ] Feature engineering:
  - Temporal: hour (cyclic encoding sin/cos), day_of_week, day_of_month, is_weekend, week_of_year
  - Lag features: count เมื่อ 1h/24h/168h ที่แล้ว
  - Rolling stats: mean/std ของ 24h, 7d
  - Weather: temp, rain_mm, condition (one-hot)
  - Calendar: is_holiday (Thai holidays), is_payday (วันที่ 15 & สิ้นเดือน), is_exam_week (KMUTT academic calendar)
  - Domain: active_flash_sales, active_vendors_count
  - External: Songkran, Loy Krathong, university events
- [ ] Train/val/test split: time-based (last 2 weeks = test)
- [ ] Model 1 — **Prophet** (baseline)
  - Good for seasonality + holiday effects
  - ใช้ `holidays` library + custom Thai holidays
- [ ] Model 2 — **LightGBM** (main model)
  - Multi-output regression: predict 168 hours ahead พร้อมกัน
  - Hyperparam tuning ด้วย Optuna (50 trials)
- [ ] Model 3 — **Ensemble** (Prophet × 0.3 + LightGBM × 0.7)
- [ ] Evaluation metrics: MAE, MAPE, RMSE, Weighted Quantile Loss
- [ ] MLflow tracking: log hyperparams, metrics, artifacts
- [ ] Promote model ไป production: เฉพาะเมื่อ MAE บน holdout < current production
- [ ] Cron job: retrain ทุก 03:00 ทุกวัน
- [ ] Drift detection: ถ้า prediction error สูงผิดปกติ 3 วันติด → แจ้ง admin

**Model Code Skeleton**
```python
# forecast-service/train.py
import pandas as pd
import lightgbm as lgb
from prophet import Prophet
import mlflow
import optuna

def load_training_data(start_date, end_date):
    # Query Postgres
    query = """
    SELECT
      chs.bucket_start,
      chs.estimated_count AS y,
      chs.day_of_week, chs.hour_of_day, chs.is_holiday,
      chs.active_flash_sales, chs.active_vendors,
      ws.temperature_c, ws.rain_mm, ws.condition
    FROM crowd_hourly_snapshots chs
    LEFT JOIN weather_snapshots ws
      ON date_trunc('hour', ws.timestamp) = chs.bucket_start
    WHERE chs.bucket_start BETWEEN %s AND %s
    ORDER BY chs.bucket_start
    """
    return pd.read_sql(query, conn, params=[start_date, end_date])

def engineer_features(df):
    df['hour_sin'] = np.sin(2 * np.pi * df['hour_of_day'] / 24)
    df['hour_cos'] = np.cos(2 * np.pi * df['hour_of_day'] / 24)
    df['dow_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
    df['dow_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)

    # Lag features
    for lag in [1, 24, 168]:
        df[f'lag_{lag}h'] = df['y'].shift(lag)

    # Rolling
    df['rolling_24h_mean'] = df['y'].rolling(24).mean()
    df['rolling_7d_mean'] = df['y'].rolling(168).mean()

    return df.dropna()

def objective(trial, X_train, y_train, X_val, y_val):
    params = {
        'objective': 'regression',
        'metric': 'mae',
        'num_leaves': trial.suggest_int('num_leaves', 15, 127),
        'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3, log=True),
        'feature_fraction': trial.suggest_float('feature_fraction', 0.6, 1.0),
        'bagging_fraction': trial.suggest_float('bagging_fraction', 0.6, 1.0),
        'min_child_samples': trial.suggest_int('min_child_samples', 5, 100),
    }
    model = lgb.LGBMRegressor(**params, n_estimators=1000)
    model.fit(X_train, y_train,
              eval_set=[(X_val, y_val)],
              callbacks=[lgb.early_stopping(50)])
    return mean_absolute_error(y_val, model.predict(X_val))

def train_and_register():
    with mlflow.start_run():
        df = load_training_data(start, end)
        df = engineer_features(df)

        X_train, X_val, X_test = time_split(df)

        study = optuna.create_study(direction='minimize')
        study.optimize(lambda t: objective(t, X_train, y_train, X_val, y_val), n_trials=50)

        best_model = lgb.LGBMRegressor(**study.best_params, n_estimators=1000)
        best_model.fit(X_train, y_train)

        mae = mean_absolute_error(y_test, best_model.predict(X_test))
        mape = mean_absolute_percentage_error(y_test, best_model.predict(X_test))

        mlflow.log_params(study.best_params)
        mlflow.log_metrics({'mae': mae, 'mape': mape})
        mlflow.lightgbm.log_model(best_model, 'model', registered_model_name='crowd_forecast')

        if mae < get_current_production_mae():
            promote_to_production(run_id)
```

#### 7.3 Serving API

**Tasks**
- [ ] FastAPI endpoint `GET /forecast?from=iso&hours=168`
- [ ] Redis cache: TTL 15 นาที (prediction ไม่เปลี่ยนเร็ว)
- [ ] Endpoint `GET /forecast/now` → busy level ปัจจุบัน + next 3 hours
- [ ] Endpoint `GET /forecast/best-times?date=YYYY-MM-DD` → top 3 ช่วงเวลาที่คนน้อย
- [ ] Endpoint `POST /forecast/impact` → vendor simulate ว่าถ้าปล่อย flash sale ตอน X จะมีคนเห็นกี่คน
- [ ] Authentication ด้วย internal API key (Next.js ↔ FastAPI)
- [ ] Health check + Prometheus metrics

**Response Format**
```json
GET /forecast?from=2026-04-18T17:00:00Z&hours=24

{
  "generated_at": "2026-04-18T16:30:00Z",
  "model_version": "lgb_20260418_03",
  "predictions": [
    {
      "time": "2026-04-18T17:00:00Z",
      "count": 42,
      "lower": 28,
      "upper": 58,
      "level": "MODERATE"
    },
    {
      "time": "2026-04-18T18:00:00Z",
      "count": 127,
      "lower": 98,
      "upper": 156,
      "level": "BUSY"
    }
    // ...
  ]
}
```

#### 7.4 Frontend Visualization

**Tasks**
- [ ] หน้า `/crowd` แสดง dashboard สาธารณะ
- [ ] Component `<CrowdHeatmap>` — 7 วัน × 24 ชั่วโมง grid (แบบ Google Popular Times)
  - แกน X: ชั่วโมง 0-23
  - แกน Y: วันจันทร์-อาทิตย์
  - สี: gradient จาก cool (quiet) → warm (busy)
  - Tooltip แสดงตัวเลขจริง
- [ ] Component `<CrowdLineChart>` — Recharts line chart 24 ชั่วโมงถัดไป
  - เส้นหลัก = predicted count
  - Shaded area = confidence interval
  - Marker จุดปัจจุบัน
- [ ] Component `<BusyBadge>` — แสดงสถานะบน shop card (ใช้ระดับของทั้งตลาด proxy)
- [ ] Component `<BestTimeWidget>` — "เวลาที่ดีที่สุดวันนี้: 14:00-16:00 (คนน้อย)"
- [ ] Integration กับ flash sale detail: "ถ้าซื้อตอนนี้คาดว่าจะต้องรอประมาณ 10 นาที"
- [ ] Vendor dashboard: "พรุ่งนี้คาดว่ามีคน ~450 คน, ช่วงพีค 18:00-20:00"
- [ ] Vendor recommendation: "แนะนำปล่อย flash sale ตอน 17:30 - 18:30 คาดว่าจะถึง 180 คน"

**Heatmap Example (Pseudo-code)**
```tsx
<CrowdHeatmap data={weeklyForecast}>
  {/* แสดงเป็น SVG grid 7×24 */}
  {/* สี: hsl(200, 60%, 90% → 30%) ตาม busy level */}
  {/* Click cell → show detail popup */}
</CrowdHeatmap>
```

#### 7.5 Alerts & Integration

**Tasks**
- [ ] Notification type ใหม่: `crowd_alert`
  - "ตลาดเริ่มคนน้อยแล้ว ตอนนี้เหมาะไปทานข้าว" (ส่งเมื่อ level ตกจาก BUSY → MODERATE)
  - "พรุ่งนี้คาดว่าคนเยอะมาก แนะนำไปก่อน 17:00" (ส่งเย็นวันก่อน)
- [ ] User setting: เปิด/ปิด crowd alert
- [ ] Vendor alert: "คาดว่าในอีก 1 ชั่วโมงจะเริ่มพีค เตรียมของให้พร้อม"
- [ ] Flash sale smart scheduling: แนะนำเวลาปล่อย flash sale อัตโนมัติ
- [ ] Export CSV/Excel สำหรับ vendor

**API Endpoints**
```
GET    /api/crowd/now                       # busy level ปัจจุบัน
GET    /api/crowd/forecast?hours=168        # heatmap data
GET    /api/crowd/best-times?date=YYYY-MM-DD
POST   /api/crowd/checkin                   # QR check-in
POST   /api/vendor/report-density           # vendor report busy/quiet
POST   /api/vendor/flash-sale-impact        # simulate impact
```

#### 7.6 Success Criteria

**Technical**
- [ ] MAE < 20 คน/ชั่วโมง (หลัง train 4 สัปดาห์)
- [ ] MAPE < 25% สำหรับช่วง peak hours
- [ ] Forecast API p95 latency < 200ms (cached)
- [ ] Daily retrain ทำงานอัตโนมัติ ไม่พัง
- [ ] Model version tracking ใน MLflow

**Product**
- [ ] User เปิดหน้า crowd forecast > 15% ของ session
- [ ] Vendor ใช้ "flash sale impact simulator" > 30% ของการสร้าง flash sale
- [ ] Check-in QR ≥ 50 ครั้ง/วัน หลัง launch 1 เดือน

**Caveats**
- 2 สัปดาห์แรกหลัง launch accuracy จะต่ำ เพราะข้อมูลยังน้อย → แสดง disclaimer "กำลังเรียนรู้"
- Holiday ที่ไม่เคยเห็นมาก่อน (Songkran ปีแรก) → prediction อาจเพี้ยน → ให้ admin override ได้

---

### 🛠️ Sprint 8 — Admin Dashboard, Testing & Launch (Week 9)

**เป้าหมาย:** Admin จัดการระบบได้ ทดสอบครบทุก flow deploy production

**Tasks — Admin**
- [ ] Admin dashboard: KPI (MAU, vendor count, flash sales today, revenue est.)
- [ ] จัดการ vendor: approve, suspend, delete
- [ ] จัดการ user: ban, reset password
- [ ] Review moderation: อนุมัติ / ลบรีวิวที่ถูกรายงาน
- [ ] ดู notification logs + bounce rate
- [ ] Analytics: top categories, peak hours, heat map
- [ ] **Crowd Forecast monitoring:** ดู model accuracy (MAE/MAPE แบบ realtime), override prediction, manual retrain trigger
- [ ] **QR checkpoint management:** สร้าง/ปิดการใช้ QR checkpoint, ดู check-in history
- [ ] **Event calendar:** เพิ่ม event พิเศษ (คอนเสิร์ต, เทศกาล) ให้ model รู้ล่วงหน้า

**Tasks — Testing**
- [ ] Unit tests สำหรับ lib/ (geo, validation, price calc)
- [ ] Integration tests สำหรับ API routes
- [ ] E2E tests ด้วย Playwright สำหรับ critical path:
  - Register → onboarding → create flash sale
  - Browse map → open shop → follow
  - Flash sale countdown → expire → status change
- [ ] Load test: 1000 concurrent users บน map (k6)
- [ ] Accessibility audit (Lighthouse, axe-core) เป้า score 90+
- [ ] Cross-browser: Chrome, Safari, Firefox, Edge, Samsung Internet

**Tasks — Polish & Launch**
- [ ] Error boundary + friendly error pages (404, 500, offline)
- [ ] Loading skeletons ทุกหน้า
- [ ] Empty states สวย (illustrations)
- [ ] SEO: sitemap.xml, robots.txt, OG meta tags, JSON-LD (LocalBusiness schema)
- [ ] Analytics: Vercel Analytics + PostHog (optional)
- [ ] Sentry error tracking
- [ ] Performance: Lighthouse mobile score > 85
- [ ] PWA manifest + offline page
- [ ] Privacy policy + Terms of service (PDPA compliance)
- [ ] เขียน onboarding tutorial สำหรับ vendor (Thai)
- [ ] Production deploy + smoke test
- [ ] เตรียม content: โปสเตอร์ QR code ติดในตลาด

**Launch Checklist**
- [ ] Domain จริง + SSL
- [ ] Supabase production project (ไม่ใช่ dev/staging)
- [ ] Rate limiting ทุก public API
- [ ] CORS policy
- [ ] CSP headers
- [ ] Backup strategy (daily snapshot)
- [ ] Incident runbook

**Acceptance Criteria**
- Lighthouse Performance > 85, Accessibility > 90, Best Practices > 95
- ทุก critical path ผ่าน E2E test
- Error rate < 1% ใน 48 ชั่วโมงแรกหลัง launch
- รอบ ๆ ตลาดมีโปสเตอร์ QR code 5 จุด

---

## API Design

### REST Convention
```
GET    /api/resource           # list
POST   /api/resource           # create
GET    /api/resource/:id       # read
PATCH  /api/resource/:id       # update
DELETE /api/resource/:id       # delete
```

### Response Format
```json
// Success
{
  "data": { ... },
  "meta": { "page": 1, "total": 42 }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Price must be positive",
    "fields": { "price": "must be > 0" }
  }
}
```

### Authentication
- Header: `Authorization: Bearer <supabase_jwt>`
- Middleware ตรวจสอบ JWT ทุก protected route
- Refresh token rotation ทุก 1 ชั่วโมง

### Rate Limiting
- Public endpoints: 60 req/min/IP
- Authenticated: 300 req/min/user
- Vendor actions: 100 req/min/vendor

---

## Design System

### Color Palette
```css
/* Warm market-inspired palette */
--primary:        #C84B31  /* market red */
--primary-fg:     #FFFFFF
--secondary:      #FFB84D  /* warm amber */
--accent:         #2D7D6E  /* fresh green */
--background:     #FAF7F2  /* warm off-white */
--surface:        #FFFFFF
--muted:          #6B7280
--border:         #E5E0D8
--success:        #16A34A
--warning:        #F59E0B
--danger:         #DC2626
--flash-sale:     #FF3B30  /* vivid red สำหรับ badge */
```

### Typography
- **Headings:** `IBM Plex Sans Thai` (weight 600-700)
- **Body:** `IBM Plex Sans Thai` + `Inter` (weight 400-500)
- **Mono:** `JetBrains Mono` (สำหรับราคา, countdown)

### Scale
```
text-xs   12px
text-sm   14px
text-base 16px   ← body default
text-lg   18px
text-xl   20px
text-2xl  24px
text-3xl  30px   ← section heading
text-4xl  36px   ← page heading
```

### Spacing & Radius
- Base unit: 4px
- Container max-width: 1280px
- Default radius: `rounded-xl` (12px)
- Card radius: `rounded-2xl` (16px)
- Button radius: `rounded-full` (pill) หรือ `rounded-lg`

### Component Principles
- ไม่ใช้ emoji ใน UI (ยกเว้น flag/symbol จำเป็น)
- ใช้ Lucide icon แทน emoji
- Shadow แบบ subtle: `shadow-sm` / `shadow-md` เท่านั้น
- Hover state มี micro-animation (scale 1.02 หรือ color transition 150ms)
- Focus ring ชัดเจนสำหรับ accessibility

### Responsive Breakpoints
```
sm:  640px    /* mobile landscape / small tablet */
md:  768px    /* tablet */
lg:  1024px   /* laptop */
xl:  1280px   /* desktop */
2xl: 1536px   /* large desktop */
```

### Mobile-First Components
- Bottom navigation (5 tabs: Home, Map, Flash Sale, Feed, Profile)
- Bottom sheet สำหรับ filter + shop detail
- Swipeable card carousel
- Pull-to-refresh

---

## Deployment & DevOps

### Environments
| Env | Branch | URL | DB |
|-----|--------|-----|-----|
| Dev | `dev` | localhost | Supabase dev project |
| Staging | `staging` | staging.thungkhru61.com | Supabase staging |
| Production | `main` | thungkhru61.com | Supabase prod |

### CI/CD Pipeline (GitHub Actions)
```yaml
on: [push, pull_request]
jobs:
  test:
    - pnpm install
    - pnpm lint
    - pnpm typecheck
    - pnpm test
  e2e:
    - pnpm build
    - pnpm playwright test
  deploy:
    if: branch == 'main'
    - vercel deploy --prod
    - supabase db push
```

### Monitoring
- **Sentry** — error tracking + performance
- **Vercel Analytics** — web vitals + page views
- **Supabase Logs** — slow queries, failed auth
- **Uptime Robot** — uptime check ทุก 5 นาที

### Backup
- Supabase automatic daily backup (7 วัน retention)
- Weekly manual snapshot to S3
- Storage bucket replication

---

## Success Metrics

### North Star Metric
**Weekly Active Flash Sales Viewed** (WAFV) — จำนวนครั้งที่ user เปิดดู flash sale / สัปดาห์

### Vendor-side KPIs
- จำนวน vendor ที่ active (ไม่ใช่แค่ signup)
- Flash sales created / vendor / สัปดาห์
- เวลาที่ใช้สร้าง flash sale ครั้งแรก (target < 3 นาที)

### Customer-side KPIs
- DAU / MAU ratio (target > 25%)
- Notification click-through rate (target > 15%)
- Session duration บน map page (target > 1 นาที)
- จำนวนร้านที่ follow / user

### Business KPIs (ที่ประเมินได้)
- Transactions claimed (เชคอินที่ร้าน)
- Estimated savings จาก flash sale
- Vendor satisfaction score (NPS)

### Technical KPIs
- API p95 latency < 300ms
- Map load time < 2s
- Push notification delivery rate > 95%
- Uptime > 99.5%

### ML Model KPIs (Crowd Forecast)
- **Forecast MAE** < 20 คน/ชั่วโมง (หลังข้อมูล 4 สัปดาห์)
- **Forecast MAPE** < 25% ในช่วง peak hours
- **Coverage** — interval coverage rate (true value อยู่ใน confidence interval 80%+)
- **Inference latency** p95 < 200ms
- **Retrain success rate** > 99% (daily cron ไม่พัง)
- **Data completeness** — crowd_data_points ต้องมีอย่างน้อย 100 rows/ชั่วโมงในช่วงเปิดตลาด

---

## Timeline

```
Week 1  [■■■■■] Sprint 0 — Foundation
Week 2  [■■■■■] Sprint 1 — Auth
Week 3  [■■■■■] Sprint 2 — Vendor Shop
Week 4  [■■■■■] Sprint 3 — Products & Flash Sale
Week 5  [■■■■■] Sprint 4 — Map
Week 6  [■■■■■] Sprint 5 — Notifications
Week 7  [■■■■■] Sprint 6 — Search & Social
Week 8  [■■■■■] Sprint 7 — Crowd Forecasting
Week 9  [■■■■■] Sprint 8 — Admin, Testing, Launch
```

### Milestones
- **M1 (End of Week 2):** Auth ทำงานครบ deploy preview ได้
- **M2 (End of Week 4):** Vendor สร้างร้าน + flash sale ได้จริง (internal demo)
- **M3 (End of Week 6):** Notification system ทำงาน (closed beta กับร้าน 5 ร้าน)
- **M4 (End of Week 7):** Social features + Data collection เริ่มเก็บข้อมูลจริง (critical! ต้องเก็บก่อน train)
- **M5 (End of Week 8):** Crowd forecast ใช้งานได้ (MAE baseline แม้ข้อมูลจะยังน้อย)
- **M6 (End of Week 9):** Public launch

> **หมายเหตุสำคัญ:** เพื่อให้ forecast model มีข้อมูล train เพียงพอ Sprint 5 (Notifications) ต้อง deploy `crowdLogger` edge function ไปด้วย (แม้จะ activate เต็มใน Sprint 7) — ทำให้ Sprint 7 มีข้อมูล 2-3 สัปดาห์ล่วงหน้าให้ train ได้

### Post-Launch Roadmap (เฟส 2)
- Reward system (stamp card ดิจิทัล)
- Voucher / coupon
- Chat ระหว่าง vendor-customer
- Multi-market support (ขยายไปตลาดอื่น)
- ระบบจ่ายเงิน (PromptPay QR)
- Native mobile app (React Native)

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Vendor ไม่ยอมใช้ระบบ | สูง | กลาง | ฝึกอบรมถึงที่ตลาด, มี vendor champion 5 ร้านก่อน launch |
| Push notification ถูก block | กลาง | สูง | มี email/SMS fallback, ออกแบบ UX ให้ขอ permission หลังใช้ไป 2-3 ครั้ง |
| Location permission denied | กลาง | สูง | ให้ manual input พิกัด, แสดงร้านใกล้ตลาดเป็น default |
| Server cost สูงเกิน | กลาง | ต่ำ | Cache aggressively, Vercel edge, Supabase free tier จนกว่าจะโต |
| iOS Safari Web Push จำกัด | สูง | สูง | แจ้ง user ให้ add to home screen ก่อน, มี in-app notification center |
| ข้อมูลร้านไม่อัปเดต | กลาง | สูง | Auto-disable ร้านที่ไม่ login 14 วัน, ส่ง reminder |
| ข้อมูล crowd ไม่พอ train model | สูง | สูง | เริ่มเก็บตั้งแต่ Sprint 5, vendor survey manual estimate ย้อนหลัง 4 สัปดาห์, cold-start ใช้ Prophet อย่างเดียว |
| Model พยากรณ์ผิดอย่างแรง ทำให้ user เสีย trust | สูง | กลาง | แสดง confidence interval ชัดเจน, มี disclaimer "พยากรณ์อาจคลาดเคลื่อน", admin override ได้ |
| Concept drift (พฤติกรรมคนเปลี่ยน) | กลาง | กลาง | Daily retrain, drift detection alert, rolling evaluation 7 วัน |
| QR check-in ถูก abuse (สแกนซ้ำ) | ต่ำ | กลาง | Rate limit 1 check-in/user/15 นาที, require geofence ยืนยัน |

---

## Dependencies & Integrations

### External Services
- **Supabase** — Auth, DB, Storage, Realtime
- **Mapbox** — Map tiles (100k requests/month free)
- **Firebase Cloud Messaging** — Push notification
- **Vercel** — Hosting
- **Sentry** — Error tracking
- **Twilio / TCASMS** — SMS OTP (ใช้ SMS provider ที่รองรับเบอร์ไทย)
- **OpenWeather API** — Weather data สำหรับ forecast features (1000 calls/day free)
- **Railway / Fly.io** — Host FastAPI forecast service (~$5-10/เดือน)
- **Upstash Redis** — Cache สำหรับ forecast API (10k commands/day free)
- **MLflow** — Self-hosted บน Railway หรือใช้ DagsHub free tier

### Required API Keys
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_MAPBOX_TOKEN
FCM_SERVER_KEY
SENTRY_DSN
DATABASE_URL
OPENWEATHER_API_KEY
FORECAST_SERVICE_URL        # FastAPI endpoint
FORECAST_SERVICE_API_KEY    # internal auth
REDIS_URL                   # Upstash
MLFLOW_TRACKING_URI
```

---

## Team & Responsibilities

| Role | Responsibility |
|------|----------------|
| Product Owner | Roadmap, talk to vendors, priority |
| Full-stack Dev | Sprint 0-6, 8 ใช้ Claude Code ช่วย |
| ML Engineer (part-time) | Sprint 7 forecast model, data pipeline, MLflow |
| Designer (part-time) | Design system, marketing, illustration |
| QA (Week 8-9) | Testing plan, manual QA, bug tracking |
| Community Manager | Onboard vendor, train, support post-launch |

---

## Appendix: Glossary

- **Flash Sale** — การลดราคาพิเศษแบบจำกัดเวลา (15 นาที - 6 ชั่วโมง)
- **Geofence** — ขอบเขตพื้นที่ทางภูมิศาสตร์ที่ trigger notification
- **PWA** — Progressive Web App ติดตั้งได้ไม่ต้องผ่าน app store
- **RLS** — Row Level Security ใน Postgres
- **Booth Number** — เลขล็อกของร้านในตลาด (เช่น A-12, B-05)
- **SOS** — Service Outside of Service Hours (ร้านเปิดพิเศษนอกเวลา)
- **MAE** — Mean Absolute Error, ค่าเฉลี่ยความคลาดเคลื่อนสัมบูรณ์ (คน)
- **MAPE** — Mean Absolute Percentage Error (%)
- **Hypertable** — TimescaleDB table optimized for time-series
- **Continuous Aggregate** — Materialized view ที่ auto-refresh (TimescaleDB)
- **Busy Level** — ระดับความหนาแน่น: VERY_QUIET, QUIET, MODERATE, BUSY, VERY_BUSY, PEAK
- **Ground Truth** — ข้อมูลจริง (จาก QR check-in) ใช้วัด model accuracy
- **Concept Drift** — การเปลี่ยนแปลงของ pattern ในข้อมูลตามเวลา ทำให้ model ที่ train ไว้แม่นลดลง
- **Cold Start** — ช่วงเปิดระบบใหม่ที่ยังไม่มีข้อมูลพอจะ train model

---

**Document Owner:** Tententgc
**Last Updated:** 2026-04-18
**Version:** 1.1.0 (เพิ่ม Crowd Forecasting System)
