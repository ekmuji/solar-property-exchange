import { create } from 'zustand';

export interface MarketplaceFilters {
  lat?: number;
  lng?: number;
  radiusMiles: number;
  minSolarCapacityKw?: number;
  minEvChargers?: number;
  maxInternalPricePerKwh?: number;
  onlyWithAvailableUnits: boolean;
  onlyWithEnergyShares: boolean;
}

interface FilterStore {
  filters: MarketplaceFilters;
  setFilter: <K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) => void;
  reset: () => void;
}

const defaults: MarketplaceFilters = {
  radiusMiles: 50,
  onlyWithAvailableUnits: false,
  onlyWithEnergyShares: false,
};

export const useFilterStore = create<FilterStore>((set) => ({
  filters: defaults,
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  reset: () => set({ filters: defaults }),
}));
