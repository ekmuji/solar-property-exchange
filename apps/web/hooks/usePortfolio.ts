'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { EnergyShare } from '@/lib/types';

interface Portfolio {
  shares: (EnergyShare & { warehouse: { id: string; name: string; address: string } })[];
  summary: {
    sharesOwned: number;
    currentValue: number;
    revenueGenerated: number;
    annualKwhEntitlement: number;
    energySold: number;
  };
}

export function usePortfolio() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const token = await getToken();
      return api.get<Portfolio>('/users/me/portfolio', token);
    },
    enabled: Boolean(isSignedIn),
  });
}

export function usePurchaseShare(warehouseId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { sharePercentage: number; purchasePrice: number }) => {
      const token = await getToken();
      return api.post(`/warehouses/${warehouseId}/energy-shares/purchase`, input, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse', warehouseId] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}
