'use client';

import { useLiveAuctions } from '@/hooks/useAuction';
import { AuctionCard } from '@/components/auctions/AuctionCard';

export default function AuctionsPage() {
  const { data, isLoading } = useLiveAuctions();

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="eyebrow mb-2 text-auction">Live now</p>
      <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">Energy share auctions</h1>
      <p className="mt-3 max-w-2xl text-ink-muted">
        Bid on fractional ownership of a warehouse's solar production. Highest bid at close wins the share and its
        annual kWh entitlement.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[220px] animate-pulse rounded-lg bg-surface" />)}
        {data?.length === 0 && <p className="text-sm text-ink-muted">No live auctions right now.</p>}
        {data?.map((a) => <AuctionCard key={a.id} auction={a} />)}
      </div>
    </div>
  );
}
