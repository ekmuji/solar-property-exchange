'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';
import { useFilterStore } from '@/store/useFilterStore';
import { useWarehouses } from '@/hooks/useWarehouses';

export default function EvLandingPage() {
  const { filters } = useFilterStore();
  const { data, isLoading } = useWarehouses(filters);
  const sites = (data?.data ?? []).filter((w) => w.evChargers.length > 0);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="eyebrow mb-2 text-grid">EV charging</p>
      <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">Find a site to charge at</h1>
      <p className="mt-3 text-ink-muted">Live availability, solar mix, and price per kWh for every site.</p>

      <div className="mt-8 space-y-3">
        {isLoading && <p className="text-sm text-ink-muted">Loading sites…</p>}
        {sites.map((w) => (
          <Link
            key={w.id}
            href={`/ev/${w.id}`}
            className="panel flex items-center justify-between p-4 transition-colors hover:border-grid/50"
          >
            <div>
              <p className="font-display text-base text-ink">{w.name}</p>
              <p className="text-xs text-ink-muted">{w.address}</p>
            </div>
            <span className="meter flex items-center gap-1.5 text-sm text-grid">
              <Zap className="h-4 w-4" /> {w.evChargers.filter((c) => c.status === 'AVAILABLE').length} available
            </span>
          </Link>
        ))}
        {!isLoading && sites.length === 0 && <p className="text-sm text-ink-muted">No EV-enabled sites yet.</p>}
      </div>
    </div>
  );
}
