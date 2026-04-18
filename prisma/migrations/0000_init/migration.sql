-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'VENDOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ShopCategory" AS ENUM ('FOOD_STREET', 'FOOD_MAIN', 'DRINKS', 'DESSERTS', 'FRUITS', 'CLOTHES', 'ACCESSORIES', 'COSMETICS', 'GROCERIES', 'OTHER');

-- CreateEnum
CREATE TYPE "FlashSaleStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CrowdSource" AS ENUM ('APP_OPEN_NEARBY', 'GEOFENCE_ENTER', 'GEOFENCE_EXIT', 'QR_CHECKIN', 'VENDOR_REPORT_BUSY', 'VENDOR_REPORT_QUIET', 'FLASH_SALE_VIEW', 'MANUAL_ESTIMATE');

-- CreateEnum
CREATE TYPE "BusyLevel" AS ENUM ('VERY_QUIET', 'QUIET', 'MODERATE', 'BUSY', 'VERY_BUSY', 'PEAK');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "shopName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" "ShopCategory" NOT NULL,
    "phone" TEXT NOT NULL,
    "lineId" TEXT,
    "coverImageUrl" TEXT,
    "logoUrl" TEXT,
    "logoEmoji" TEXT NOT NULL DEFAULT '🏪',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "boothNumber" TEXT,
    "address" TEXT,
    "openTime" TEXT,
    "closeTime" TEXT,
    "openDays" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "vendorId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "imageEmoji" TEXT NOT NULL DEFAULT '🍴',
    "regularPrice" DECIMAL(10,2) NOT NULL,
    "category" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flash_sales" (
    "id" UUID NOT NULL,
    "vendorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" "FlashSaleStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notifiedUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flash_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flash_sale_items" (
    "id" UUID NOT NULL,
    "flashSaleId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "salePrice" DECIMAL(10,2) NOT NULL,
    "stockLimit" INTEGER,
    "stockSold" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "flash_sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "vendorId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "vendorId" UUID,
    "productId" UUID,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "imageUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_locations" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "isOptedIn" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "authKey" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'web',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payload" JSONB,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crowd_data_points" (
    "id" UUID NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "CrowdSource" NOT NULL,
    "signalWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "distanceM" DOUBLE PRECISION,
    "inMarket" BOOLEAN NOT NULL DEFAULT false,
    "userId" UUID,
    "vendorId" UUID,
    "metadata" JSONB,

    CONSTRAINT "crowd_data_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crowd_hourly_snapshots" (
    "id" UUID NOT NULL,
    "bucketStart" TIMESTAMP(3) NOT NULL,
    "estimatedCount" INTEGER NOT NULL,
    "rawSignalCount" INTEGER NOT NULL,
    "uniqueUsers" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "hourOfDay" INTEGER NOT NULL,
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "isRaining" BOOLEAN NOT NULL DEFAULT false,
    "temperatureC" DOUBLE PRECISION,
    "activeFlashSales" INTEGER NOT NULL DEFAULT 0,
    "activeVendors" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crowd_hourly_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crowd_forecasts" (
    "id" UUID NOT NULL,
    "targetTime" TIMESTAMP(3) NOT NULL,
    "predictedCount" INTEGER NOT NULL,
    "confidenceLower" INTEGER NOT NULL,
    "confidenceUpper" INTEGER NOT NULL,
    "busyLevel" "BusyLevel" NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crowd_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkins" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "checkpointId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_snapshots" (
    "id" UUID NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "temperatureC" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "rainMm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "condition" TEXT NOT NULL,
    "windKph" DOUBLE PRECISION,

    CONSTRAINT "weather_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forecast_models" (
    "id" UUID NOT NULL,
    "version" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "mae" DOUBLE PRECISION NOT NULL,
    "mape" DOUBLE PRECISION NOT NULL,
    "rmse" DOUBLE PRECISION NOT NULL,
    "trainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "hyperparams" JSONB,
    "featureList" TEXT[],
    "notes" TEXT,

    CONSTRAINT "forecast_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_events" (
    "id" UUID NOT NULL,
    "eventDate" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_userId_key" ON "vendors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_slug_key" ON "vendors"("slug");

-- CreateIndex
CREATE INDEX "vendors_latitude_longitude_idx" ON "vendors"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "vendors_category_idx" ON "vendors"("category");

-- CreateIndex
CREATE INDEX "products_vendorId_idx" ON "products"("vendorId");

-- CreateIndex
CREATE INDEX "flash_sales_status_startAt_endAt_idx" ON "flash_sales"("status", "startAt", "endAt");

-- CreateIndex
CREATE UNIQUE INDEX "flash_sale_items_flashSaleId_productId_key" ON "flash_sale_items"("flashSaleId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "follows_userId_vendorId_key" ON "follows"("userId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_productId_key" ON "favorites"("userId", "productId");

-- CreateIndex
CREATE INDEX "reviews_vendorId_idx" ON "reviews"("vendorId");

-- CreateIndex
CREATE INDEX "reviews_productId_idx" ON "reviews"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "user_locations_userId_key" ON "user_locations"("userId");

-- CreateIndex
CREATE INDEX "user_locations_latitude_longitude_idx" ON "user_locations"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_endpoint_key" ON "device_tokens"("endpoint");

-- CreateIndex
CREATE INDEX "device_tokens_userId_idx" ON "device_tokens"("userId");

-- CreateIndex
CREATE INDEX "notification_logs_userId_sentAt_idx" ON "notification_logs"("userId", "sentAt");

-- CreateIndex
CREATE INDEX "crowd_data_points_timestamp_idx" ON "crowd_data_points"("timestamp");

-- CreateIndex
CREATE INDEX "crowd_data_points_inMarket_timestamp_idx" ON "crowd_data_points"("inMarket", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "crowd_hourly_snapshots_bucketStart_key" ON "crowd_hourly_snapshots"("bucketStart");

-- CreateIndex
CREATE INDEX "crowd_hourly_snapshots_dayOfWeek_hourOfDay_idx" ON "crowd_hourly_snapshots"("dayOfWeek", "hourOfDay");

-- CreateIndex
CREATE INDEX "crowd_forecasts_targetTime_idx" ON "crowd_forecasts"("targetTime");

-- CreateIndex
CREATE UNIQUE INDEX "crowd_forecasts_targetTime_modelVersion_key" ON "crowd_forecasts"("targetTime", "modelVersion");

-- CreateIndex
CREATE INDEX "checkins_timestamp_idx" ON "checkins"("timestamp");

-- CreateIndex
CREATE INDEX "checkins_checkpointId_timestamp_idx" ON "checkins"("checkpointId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "weather_snapshots_timestamp_key" ON "weather_snapshots"("timestamp");

-- CreateIndex
CREATE INDEX "weather_snapshots_timestamp_idx" ON "weather_snapshots"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "forecast_models_version_key" ON "forecast_models"("version");

-- CreateIndex
CREATE INDEX "market_events_eventDate_idx" ON "market_events"("eventDate");

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flash_sales" ADD CONSTRAINT "flash_sales_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flash_sale_items" ADD CONSTRAINT "flash_sale_items_flashSaleId_fkey" FOREIGN KEY ("flashSaleId") REFERENCES "flash_sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flash_sale_items" ADD CONSTRAINT "flash_sale_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

