'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import type { Auction } from '@/lib/types';

export function useAuction(id: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['auction', id],
    queryFn: () => api.get<Auction>(`/auctions/${id}`),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (!id) return;
    const socket = getSocket('auctions');
    socket.emit('subscribe', { auctionId: id });

    const onNewBid = () => queryClient.invalidateQueries({ queryKey: ['auction', id] });
    const onEnded = () => queryClient.invalidateQueries({ queryKey: ['auction', id] });

    socket.on('new_bid', onNewBid);
    socket.on('auction_ended', onEnded);
    return () => {
      socket.off('new_bid', onNewBid);
      socket.off('auction_ended', onEnded);
    };
  }, [id, queryClient]);

  return query;
}

export function usePlaceBid(auctionId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      const token = await getToken();
      return api.post(`/auctions/${auctionId}/bids`, { amount }, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auction', auctionId] }),
  });
}

export function useLiveAuctions(warehouseId?: string) {
  return useQuery({
    queryKey: ['auctions', warehouseId ?? 'all'],
    queryFn: () => api.get<Auction[]>(`/auctions${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),
  });
}
