'use client';

import { TradingPanel } from '@/components/trading/TradingPanel';

export default function TradingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <p className="eyebrow mb-2 text-grid">Energy marketplace</p>
      <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">Trade electricity</h1>
      <p className="mt-3 max-w-2xl text-ink-muted">
        Buy and sell unused kWh directly with other share owners. Orders match automatically on price-time priority —
        crossing orders fill instantly at the midpoint price.
      </p>

      <div className="mt-8">
        <TradingPanel />
      </div>
    </div>
  );
}
