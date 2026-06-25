import { PrismaClient, UserRole, UnitStatus, ChargerType, ChargerStatus, AuctionStatus, TradeSide, TradeStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  const owner = await prisma.user.upsert({
    where: { email: 'owner@spx.dev' },
    update: {},
    create: { clerkId: 'seed_owner', name: 'Greenfield Estates Ltd', email: 'owner@spx.dev', role: UserRole.OWNER },
  });

  const investorA = await prisma.user.upsert({
    where: { email: 'investor-a@spx.dev' },
    update: {},
    create: { clerkId: 'seed_investor_a', name: 'Acorn Logistics', email: 'investor-a@spx.dev', role: UserRole.INVESTOR },
  });

  const investorB = await prisma.user.upsert({
    where: { email: 'investor-b@spx.dev' },
    update: {},
    create: { clerkId: 'seed_investor_b', name: 'Midland Cold Chain', email: 'investor-b@spx.dev', role: UserRole.INVESTOR },
  });

  const driver = await prisma.user.upsert({
    where: { email: 'driver@spx.dev' },
    update: {},
    create: { clerkId: 'seed_driver', name: 'Sam Driver', email: 'driver@spx.dev', role: UserRole.DRIVER },
  });

  // ---------------------------------------------------------------------
  // Warehouse Alpha — Birmingham, matches the PRD worked example
  // ---------------------------------------------------------------------
  const alpha = await prisma.warehouse.create({
    data: {
      name: 'Warehouse Alpha',
      address: 'Tyburn Road Industrial Estate, Birmingham, B24 8HJ',
      latitude: 52.5121,
      longitude: -1.8175,
      description: '1.2MW rooftop solar array over a multi-let logistics unit with on-site EV charging and 35% of energy production still available as fractional shares.',
      photos: [],
      totalUnits: 5,
      ownerId: owner.id,
    },
  });

  await prisma.warehouseUnit.createMany({
    data: [
      { warehouseId: alpha.id, unitNumber: 'Unit 1', sqft: 12000, status: UnitStatus.LEASED, monthlyRent: 8400 },
      { warehouseId: alpha.id, unitNumber: 'Unit 2', sqft: 9500, status: UnitStatus.AVAILABLE, monthlyRent: 6650, availableDate: new Date() },
      { warehouseId: alpha.id, unitNumber: 'Unit 3', sqft: 9500, status: UnitStatus.AVAILABLE, monthlyRent: 6650, availableDate: new Date() },
      { warehouseId: alpha.id, unitNumber: 'Unit 4', sqft: 2500, status: UnitStatus.AVAILABLE, monthlyRent: 1750, availableDate: new Date() },
      { warehouseId: alpha.id, unitNumber: 'Unit 5', sqft: 7000, status: UnitStatus.AVAILABLE, monthlyRent: 4900, availableDate: new Date() },
      { warehouseId: alpha.id, unitNumber: 'Unit 7', sqft: 5000, status: UnitStatus.AVAILABLE, monthlyRent: 3500, availableDate: new Date() },
    ],
  });

  const solarAlpha = await prisma.solarAsset.create({
    data: {
      warehouseId: alpha.id,
      capacityKw: 1200,
      annualGenerationKwh: 1_100_000,
      batteryCapacityKwh: 250,
      currentProductionKw: 860,
    },
  });

  // 30 days of fake production history for the chart
  const today = new Date();
  await prisma.productionRecord.createMany({
    data: Array.from({ length: 30 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (29 - i));
      const base = 2800 + Math.sin(i / 4) * 600;
      return { solarAssetId: solarAlpha.id, date, generatedKwh: Math.max(400, Math.round(base + (Math.random() - 0.5) * 400)) };
    }),
  });

  // 65% already allocated, 35% remaining per the PRD example
  const sharedAlpha = await prisma.energyShare.create({
    data: {
      warehouseId: alpha.id,
      sharePercentage: 65,
      annualKwh: 715_000,
      ownerId: investorA.id,
      purchasePrice: 312000,
      internalRatePerKwh: 0.09,
    },
  });

  await prisma.evCharger.createMany({
    data: [
      { warehouseId: alpha.id, label: 'CP-01', chargerType: ChargerType.DC_RAPID, powerKw: 50, status: ChargerStatus.AVAILABLE, pricePerKwh: 0.18 },
      { warehouseId: alpha.id, label: 'CP-02', chargerType: ChargerType.DC_RAPID, powerKw: 50, status: ChargerStatus.OCCUPIED, pricePerKwh: 0.18 },
      { warehouseId: alpha.id, label: 'CP-03', chargerType: ChargerType.AC_FAST, powerKw: 22, status: ChargerStatus.AVAILABLE, pricePerKwh: 0.16 },
      { warehouseId: alpha.id, label: 'CP-04', chargerType: ChargerType.DC_ULTRA_RAPID, powerKw: 150, status: ChargerStatus.AVAILABLE, pricePerKwh: 0.22 },
    ],
  });

  // Live auction for the remaining 20% share, matching the PRD example
  const auctionEnd = new Date();
  auctionEnd.setDate(auctionEnd.getDate() + 14);
  const auction = await prisma.auction.create({
    data: {
      warehouseId: alpha.id,
      energyShareId: sharedAlpha.id,
      sharePercentage: 20,
      reservePrice: 100000,
      currentPrice: 120000,
      startDate: new Date(),
      endDate: auctionEnd,
      status: AuctionStatus.LIVE,
    },
  });

  await prisma.bid.createMany({
    data: [
      { auctionId: auction.id, userId: investorA.id, amount: 105000 },
      { auctionId: auction.id, userId: investorB.id, amount: 112500 },
      { auctionId: auction.id, userId: investorA.id, amount: 120000 },
    ],
  });

  // Open order book entries for the trading screen
  await prisma.energyTrade.createMany({
    data: [
      { userId: investorA.id, side: TradeSide.SELL, quantityKwh: 5000, pricePerKwh: 0.12, status: TradeStatus.OPEN, warehouseId: alpha.id },
      { userId: investorB.id, side: TradeSide.SELL, quantityKwh: 2000, pricePerKwh: 0.13, status: TradeStatus.OPEN, warehouseId: alpha.id },
      { userId: investorA.id, counterpartyId: investorB.id, side: TradeSide.SELL, quantityKwh: 3000, filledKwh: 3000, pricePerKwh: 0.135, status: TradeStatus.FILLED, warehouseId: alpha.id },
    ],
  });

  // ---------------------------------------------------------------------
  // Warehouse Beta — second listing so search/filters have something to filter
  // ---------------------------------------------------------------------
  const beta = await prisma.warehouse.create({
    data: {
      name: 'Warehouse Beta',
      address: 'Trafford Park, Manchester, M17 1EH',
      latitude: 53.4661,
      longitude: -2.3494,
      description: 'Newly commissioned 800kW array, fully available for fractional ownership.',
      totalUnits: 3,
      ownerId: owner.id,
    },
  });

  await prisma.warehouseUnit.createMany({
    data: [
      { warehouseId: beta.id, unitNumber: 'Unit A', sqft: 15000, status: UnitStatus.AVAILABLE, monthlyRent: 10500, availableDate: new Date() },
      { warehouseId: beta.id, unitNumber: 'Unit B', sqft: 15000, status: UnitStatus.RESERVED, monthlyRent: 10500 },
      { warehouseId: beta.id, unitNumber: 'Unit C', sqft: 8000, status: UnitStatus.AVAILABLE, monthlyRent: 5600, availableDate: new Date() },
    ],
  });

  const solarBeta = await prisma.solarAsset.create({
    data: { warehouseId: beta.id, capacityKw: 800, annualGenerationKwh: 720_000, batteryCapacityKwh: 150, currentProductionKw: 510 },
  });

  await prisma.productionRecord.createMany({
    data: Array.from({ length: 30 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (29 - i));
      const base = 1900 + Math.sin(i / 5) * 400;
      return { solarAssetId: solarBeta.id, date, generatedKwh: Math.max(300, Math.round(base + (Math.random() - 0.5) * 300)) };
    }),
  });

  await prisma.evCharger.createMany({
    data: [
      { warehouseId: beta.id, label: 'CP-01', chargerType: ChargerType.AC_FAST, powerKw: 22, status: ChargerStatus.AVAILABLE, pricePerKwh: 0.15 },
      { warehouseId: beta.id, label: 'CP-02', chargerType: ChargerType.AC_FAST, powerKw: 22, status: ChargerStatus.AVAILABLE, pricePerKwh: 0.15 },
    ],
  });

  console.log('Seed complete:', { owner: owner.id, alpha: alpha.id, beta: beta.id, driver: driver.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
