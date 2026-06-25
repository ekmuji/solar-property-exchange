'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import type { OrderBookEntry, TradeSide } from '@/lib/types';

export function useOrderBook(warehouseId?: string) {
  const queryClient = useQueryClient();
  const key = ['orderBook', warehouseId ?? 'global'];

  const query = useQuery({
    queryKey: key,
    queryFn: () => api.get<{ buys: OrderBookEntry[]; sells: OrderBookEntry[] }>(
      `/trading/order-book${warehouseId ? `?warehouseId=${warehouseId}` : ''}`,
    ),
  });

  useEffect(() => {
    const socket = getSocket('trading');
    socket.emit('subscribe', { warehouseId });

    const onUpdate = () => queryClient.invalidateQueries({ queryKey: key });
    socket.on('order_book', onUpdate);
    socket.on('trade_executed', onUpdate);
    return () => {
      socket.off('order_book', onUpdate);
      socket.off('trade_executed', onUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseId]);

  return query;
}

export function usePlaceOrder(warehouseId?: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { side: TradeSide; quantityKwh: number; pricePerKwh: number }) => {
      const token = await getToken();
      return api.post('/trading/orders', { ...input, warehouseId }, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orderBook', warehouseId ?? 'global'] }),
  });
}
