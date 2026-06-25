'use client';

import { useQuery } from '@tanstack/react-query';
import { api, buildQuery } from '@/lib/api';
import type { PaginatedResponse, Warehouse } from '@/lib/types';
import type { MarketplaceFilters } from '@/store/useFilterStore';

export function useWarehouses(filters: MarketplaceFilters) {
  const qs = buildQuery({
    lat: filters.lat,
    lng: filters.lng,
    radiusMiles: filters.radiusMiles,
    minSolarCapacityKw: filters.minSolarCapacityKw,
    minEvChargers: filters.minEvChargers,
    maxInternalPricePerKwh: filters.maxInternalPricePerKwh,
    onlyWithAvailableUnits: filters.onlyWithAvailableUnits || undefined,
    onlyWithEnergyShares: filters.onlyWithEnergyShares || undefined,
  });

  return useQuery({
    queryKey: ['warehouses', filters],
    queryFn: () => api.get<PaginatedResponse<Warehouse>>(`/warehouses${qs}`),
    placeholderData: (prev) => prev,
  });
}

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: ['warehouse', id],
    queryFn: () => api.get<Warehouse>(`/warehouses/${id}`),
    enabled: Boolean(id),
  });
}
