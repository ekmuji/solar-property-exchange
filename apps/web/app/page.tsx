'use client';

import dynamic from 'next/dynamic';
import { useFilterStore } from '@/store/useFilterStore';
import { useWarehouses } from '@/hooks/useWarehouses';
import { SearchFilters } from '@/components/marketplace/SearchFilters';
import { WarehouseCard } from '@/components/marketplace/WarehouseCard';

const MapView = dynamic(() => import('@/components/marketplace/MapView').then((m) => m.MapView), { ssr: false });

export default function MarketplacePage() {
  const { filters } = useFilterStore();
  const { data, isLoading, isError } = useWarehouses(filters);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 max-w-2xl">
        <p className="eyebrow mb-2 text-solar">Marketplace</p>
        <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">
          Every warehouse here is also a power station.
        </h1>
        <p className="mt-3 text-ink-muted">
          Lease the floor space, buy a slice of the rooftop array, or just plug in — search by location, solar
          capacity, EV charging, and what's left to buy in.
        </p>
      </div>

      <div className="mb-8 h-[360px] overflow-hidden rounded-lg border border-border">
        <MapView warehouses={data?.data ?? []} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <SearchFilters />
        </aside>

        <div>
          {isLoading && <GridSkeleton />}
          {isError && (
            <p className="panel p-6 text-sm text-auction">
              Couldn't reach the API. Is the NestJS server running on NEXT_PUBLIC_API_URL?
            </p>
          )}
          {data && data.data.length === 0 && (
            <p className="panel p-10 text-center text-sm text-ink-muted">No warehouses match those filters yet.</p>
          )}
          {data && data.data.length > 0 && (
            <>
              <p className="eyebrow mb-4">{data.total} listing{data.total === 1 ? '' : 's'}</p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data.data.map((w) => (
                  <WarehouseCard key={w.id} warehouse={w} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[340px] animate-pulse rounded-lg bg-surface" />
      ))}
    </div>
  );
}
