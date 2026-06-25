'use client';

import { useParams } from 'next/navigation';
import { useWarehouse } from '@/hooks/useWarehouses';
import { EVSection } from '@/components/warehouse/EVSection';

export default function EvDriverPage() {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const { data: warehouse, isLoading } = useWarehouse(warehouseId);

  if (isLoading) return <div className="mx-auto max-w-3xl px-6 py-16 text-ink-muted">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="eyebrow mb-2 text-grid">EV charging</p>
      <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">{warehouse?.name}</h1>
      <p className="mt-2 text-ink-muted">{warehouse?.address}</p>

      <div className="mt-8">
        <EVSection warehouseId={warehouseId} />
      </div>
    </div>
  );
}
