export type UnitStatus = 'AVAILABLE' | 'RESERVED' | 'LEASED' | 'AUCTIONING' | 'SOLD';
export type ChargerStatus = 'AVAILABLE' | 'OCCUPIED' | 'OFFLINE' | 'RESERVED';
export type ChargerType = 'AC_SLOW' | 'AC_FAST' | 'DC_RAPID' | 'DC_ULTRA_RAPID';
export type AuctionStatus = 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
export type TradeSide = 'BUY' | 'SELL';
export type TradeStatus = 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED';
export type UserRole = 'OWNER' | 'TENANT' | 'INVESTOR' | 'DRIVER' | 'ADMIN';

export interface WarehouseUnit {
  id: string;
  unitNumber: string;
  sqft: number;
  status: UnitStatus;
  monthlyRent: string | number;
  availableDate: string | null;
}

export interface ProductionRecord {
  id: string;
  date: string;
  generatedKwh: number;
}

export interface SolarAsset {
  id: string;
  capacityKw: number;
  annualGenerationKwh: number;
  batteryCapacityKwh: number;
  currentProductionKw: number;
  productionHistory?: ProductionRecord[];
}

export interface EnergyShare {
  id: string;
  warehouseId: string;
  sharePercentage: number;
  annualKwh: number;
  ownerId: string | null;
  owner?: { id: string; name: string } | null;
  purchasePrice: string | number | null;
  internalRatePerKwh: string | number;
}

export interface EvCharger {
  id: string;
  warehouseId: string;
  label: string;
  chargerType: ChargerType;
  powerKw: number;
  status: ChargerStatus;
  pricePerKwh: string | number;
}

export interface Auction {
  id: string;
  warehouseId: string;
  warehouse?: { id: string; name: string; address?: string };
  sharePercentage: number;
  reservePrice: string | number;
  currentPrice: string | number;
  endDate: string;
  status: AuctionStatus;
  bids?: Bid[];
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  user?: { id: string; name: string };
  amount: string | number;
  timestamp: string;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string | null;
  photos: string[];
  totalUnits: number;
  units: WarehouseUnit[];
  solarAsset: SolarAsset | null;
  evChargers: EvCharger[];
  energyShares: EnergyShare[];
  auctions?: Auction[];
  owner?: { id: string; name: string };
}

export interface OrderBookEntry {
  id: string;
  userId: string;
  user?: { id: string; name: string };
  side: TradeSide;
  quantityKwh: number;
  filledKwh: number;
  pricePerKwh: string | number;
  status: TradeStatus;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
