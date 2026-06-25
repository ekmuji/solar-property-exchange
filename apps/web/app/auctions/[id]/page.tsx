'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuction } from '@/hooks/useAuction';
import { BidPanel } from '@/components/auctions/BidPanel';
import { formatGbp } from '@/lib/utils';

export default function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: auction, isLoading, isError } = useAuction(id);

  if (isLoading) return <div className="mx-auto max-w-5xl px-6 py-16 text-ink-muted">Loading…</div>;
  if (isError || !auction) return <div className="mx-auto max-w-5xl px-6 py-16 text-auction">Couldn't load this auction.</div>;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link href={`/warehouses/${auction.warehouseId}`} className="eyebrow text-solar hover:underline">
        {auction.warehouse?.name}
      </Link>
      <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">
        {auction.sharePercentage}% energy share auction
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="panel p-5">
          <p className="eyebrow mb-4">Bid history</p>
          {!auction.bids || auction.bids.length === 0 ? (
            <p className="text-sm text-ink-muted">No bids placed yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {auction.bids.map((bid) => (
                <li key={bid.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-ink">{bid.user?.name ?? 'Bidder'}</span>
                  <span className="meter text-ink">{formatGbp(Number(bid.amount))}</span>
                  <span className="text-xs text-ink-muted">{new Date(bid.timestamp).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <BidPanel auction={auction} />
      </div>
    </div>
  );
}
