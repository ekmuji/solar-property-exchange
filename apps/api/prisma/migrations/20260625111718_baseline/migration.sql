-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'TENANT', 'INVESTOR', 'DRIVER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'LEASED', 'AUCTIONING', 'SOLD');

-- CreateEnum
CREATE TYPE "ChargerType" AS ENUM ('AC_SLOW', 'AC_FAST', 'DC_RAPID', 'DC_ULTRA_RAPID');

-- CreateEnum
CREATE TYPE "ChargerStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'OFFLINE', 'RESERVED');

-- CreateEnum
CREATE TYPE "ChargingSessionStatus" AS ENUM ('RESERVED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TradeSide" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'TENANT',
    "stripeAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "floorPlans" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "totalUnits" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_units" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "sqft" INTEGER NOT NULL,
    "status" "UnitStatus" NOT NULL DEFAULT 'AVAILABLE',
    "monthlyRent" DECIMAL(10,2) NOT NULL,
    "availableDate" TIMESTAMP(3),
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solar_assets" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "capacityKw" DOUBLE PRECISION NOT NULL,
    "annualGenerationKwh" DOUBLE PRECISION NOT NULL,
    "batteryCapacityKwh" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentProductionKw" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solar_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solar_production_records" (
    "id" TEXT NOT NULL,
    "solarAssetId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "generatedKwh" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "solar_production_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "energy_shares" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "sharePercentage" DOUBLE PRECISION NOT NULL,
    "annualKwh" DOUBLE PRECISION NOT NULL,
    "ownerId" TEXT,
    "purchasePrice" DECIMAL(12,2),
    "internalRatePerKwh" DECIMAL(6,4) NOT NULL DEFAULT 0.09,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "energy_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "energy_trades" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "counterpartyId" TEXT,
    "side" "TradeSide" NOT NULL,
    "quantityKwh" DOUBLE PRECISION NOT NULL,
    "filledKwh" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pricePerKwh" DECIMAL(6,4) NOT NULL,
    "status" "TradeStatus" NOT NULL DEFAULT 'OPEN',
    "warehouseId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "energy_trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ev_chargers" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "chargerType" "ChargerType" NOT NULL,
    "powerKw" DOUBLE PRECISION NOT NULL,
    "status" "ChargerStatus" NOT NULL DEFAULT 'AVAILABLE',
    "pricePerKwh" DECIMAL(6,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ev_chargers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charging_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chargerId" TEXT NOT NULL,
    "status" "ChargingSessionStatus" NOT NULL DEFAULT 'RESERVED',
    "reservedStart" TIMESTAMP(3),
    "reservedDuration" INTEGER,
    "energyDeliveredKwh" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "solarPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cost" DECIMAL(10,2),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "charging_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auctions" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "energyShareId" TEXT,
    "sharePercentage" DOUBLE PRECISION NOT NULL,
    "reservePrice" DECIMAL(12,2) NOT NULL,
    "currentPrice" DECIMAL(12,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "AuctionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "winningBidId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bids" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'gbp',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "chargingSessionId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "warehouses_ownerId_idx" ON "warehouses"("ownerId");

-- CreateIndex
CREATE INDEX "warehouse_units_status_idx" ON "warehouse_units"("status");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_units_warehouseId_unitNumber_key" ON "warehouse_units"("warehouseId", "unitNumber");

-- CreateIndex
CREATE UNIQUE INDEX "solar_assets_warehouseId_key" ON "solar_assets"("warehouseId");

-- CreateIndex
CREATE INDEX "solar_production_records_solarAssetId_date_idx" ON "solar_production_records"("solarAssetId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "solar_production_records_solarAssetId_date_key" ON "solar_production_records"("solarAssetId", "date");

-- CreateIndex
CREATE INDEX "energy_shares_warehouseId_idx" ON "energy_shares"("warehouseId");

-- CreateIndex
CREATE INDEX "energy_shares_ownerId_idx" ON "energy_shares"("ownerId");

-- CreateIndex
CREATE INDEX "energy_trades_status_side_idx" ON "energy_trades"("status", "side");

-- CreateIndex
CREATE INDEX "energy_trades_warehouseId_idx" ON "energy_trades"("warehouseId");

-- CreateIndex
CREATE INDEX "ev_chargers_warehouseId_status_idx" ON "ev_chargers"("warehouseId", "status");

-- CreateIndex
CREATE INDEX "charging_sessions_chargerId_status_idx" ON "charging_sessions"("chargerId", "status");

-- CreateIndex
CREATE INDEX "auctions_status_endDate_idx" ON "auctions"("status", "endDate");

-- CreateIndex
CREATE INDEX "bids_auctionId_amount_idx" ON "bids"("auctionId", "amount");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripePaymentIntentId_key" ON "payments"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_chargingSessionId_key" ON "payments"("chargingSessionId");

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_units" ADD CONSTRAINT "warehouse_units_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_units" ADD CONSTRAINT "warehouse_units_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solar_assets" ADD CONSTRAINT "solar_assets_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solar_production_records" ADD CONSTRAINT "solar_production_records_solarAssetId_fkey" FOREIGN KEY ("solarAssetId") REFERENCES "solar_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_shares" ADD CONSTRAINT "energy_shares_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_shares" ADD CONSTRAINT "energy_shares_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_trades" ADD CONSTRAINT "energy_trades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_trades" ADD CONSTRAINT "energy_trades_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ev_chargers" ADD CONSTRAINT "ev_chargers_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_sessions" ADD CONSTRAINT "charging_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_sessions" ADD CONSTRAINT "charging_sessions_chargerId_fkey" FOREIGN KEY ("chargerId") REFERENCES "ev_chargers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_energyShareId_fkey" FOREIGN KEY ("energyShareId") REFERENCES "energy_shares"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_chargingSessionId_fkey" FOREIGN KEY ("chargingSessionId") REFERENCES "charging_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
