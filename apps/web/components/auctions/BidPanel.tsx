'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import type { Auction } from '@/lib/types';
import { formatGbp } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePlaceBid } from '@/hooks/useAuction';
import { CountdownTimer } from './CountdownTimer';

export function BidPanel({ auction }: { auction: Auction }) {
  const { isSignedIn } = useAuth();
  const currentPrice = Number(auction.currentPrice);
  const minBid = Math.ceil((currentPrice + 1) * 100) / 100;
  const [amount, setAmount] = useState<number>(minBid);
  const placeBid = usePlaceBid(auction.id);
  const isLive = auction.status === 'LIVE';

  return (
    <div className="panel p-5">
      <p className="eyebrow mb-1">Auction closes in</p>
      <p className="meter mb-5 text-2xl text-auction">
        <CountdownTimer endDate={auction.endDate} />
      </p>

      <div className="mb-5 grid grid-cols-2 gap-4 border-y border-border py-4">
        <div>
          <p className="eyebrow mb-1">Current highest bid</p>
          <p className="meter text-xl text-ink">{formatGbp(currentPrice)}</p>
        </div>
        <div>
          <p className="eyebrow mb-1">Reserve price</p>
          <p className="meter text-xl text-ink">{formatGbp(Number(auction.reservePrice))}</p>
        </div>
      </div>

      {isLive ? (
        !isSignedIn ? (
          <p className="text-sm text-ink-muted">Sign in to place a bid.</p>
        ) : (
          <div className="space-y-3">
            <label className="block text-xs text-ink-muted">Your bid (min {formatGbp(minBid)})</label>
            <Input type="number" min={minBid} step="100" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
            <Button
              variant="danger"
              className="w-full"
              disabled={placeBid.isPending || amount <= currentPrice}
              onClick={() => placeBid.mutate(amount)}
            >
              {placeBid.isPending ? 'Placing bid…' : `Bid ${formatGbp(amount)}`}
            </Button>
            {placeBid.isError && <p className="text-sm text-auction">{(placeBid.error as Error).message}</p>}
          </div>
        )
      ) : (
        <p className="text-sm text-ink-muted">This auction has ended.</p>
      )}
    </div>
  );
}
