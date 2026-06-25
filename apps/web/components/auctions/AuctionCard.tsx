import Link from 'next/link';
import { Gavel } from 'lucide-react';
import type { Auction } from '@/lib/types';
import { formatGbp } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { StatusPill } from '@/components/ui/status-pill';
import { CountdownTimer } from './CountdownTimer';

export function AuctionCard({ auction }: { auction: Auction }) {
  return (
    <Link href={`/auctions/${auction.id}`}>
      <Card className="h-full transition-colors hover:border-auction/50">
        <CardContent className="pt-5">
          <div className="mb-3 flex items-center justify-between">
            <StatusPill status={auction.status} />
            <span className="meter flex items-center gap-1 text-xs text-ink-muted">
              <Gavel className="h-3 w-3" /> <CountdownTimer endDate={auction.endDate} />
            </span>
          </div>
          <p className="font-display text-lg text-ink">{auction.warehouse?.name}</p>
          <p className="mt-1 text-sm text-ink-muted">{auction.sharePercentage}% energy share</p>

          <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
            <div>
              <p className="eyebrow mb-1">Current highest bid</p>
              <p className="meter text-xl text-auction">{formatGbp(Number(auction.currentPrice))}</p>
            </div>
            <p className="eyebrow">Reserve {formatGbp(Number(auction.reservePrice))}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
