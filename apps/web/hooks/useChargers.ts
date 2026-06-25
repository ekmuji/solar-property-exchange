'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import type { EvCharger } from '@/lib/types';

interface ChargerDiscovery {
  chargers: EvCharger[];
  availableCount: number;
  solarPercentage: number;
  gridPercentage: number;
}

export function useChargers(warehouseId: string) {
  const queryClient = useQueryClient();
  const key = ['chargers', warehouseId];

  const query = useQuery({
    queryKey: key,
    queryFn: () => api.get<ChargerDiscovery>(`/warehouses/${warehouseId}/chargers`),
    enabled: Boolean(warehouseId),
  });

  useEffect(() => {
    if (!warehouseId) return;
    const socket = getSocket('ev');
    socket.emit('subscribe', { warehouseId });
    const onUpdate = () => queryClient.invalidateQueries({ queryKey: key });
    socket.on('charger_status', onUpdate);
    return () => {
      socket.off('charger_status', onUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseId]);

  return query;
}

export function useReserveCharger(chargerId: string, warehouseId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { startTime: string; durationMinutes: number }) => {
      const token = await getToken();
      return api.post(`/chargers/${chargerId}/sessions/reserve`, input, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chargers', warehouseId] }),
  });
}
