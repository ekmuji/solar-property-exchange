'use client';

import { useChargers } from '@/hooks/useChargers';
import { ChargerCard } from '@/components/ev/ChargerCard';
import { Sun, Cable } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function EVSection({ warehouseId }: { warehouseId: string }) {
  const { data, isLoading } = useChargers(warehouseId);

  if (isLoading) return <p className="text-sm text-ink-muted">Loading chargers…</p>;
  if (!data || data.chargers.length === 0) {
    return <p className="panel p-6 text-sm text-ink-muted">No EV chargers on this site.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <Cable className="mb-2 h-4 w-4 text-grid" />
            <p className="meter text-xl text-ink">{data.availableCount}/{data.chargers.length}</p>
            <p className="eyebrow mt-1">Available now</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Sun className="mb-2 h-4 w-4 text-solar" />
            <p className="meter text-xl text-ink">{data.solarPercentage}%</p>
            <p className="eyebrow mt-1">Powered by on-site solar</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="meter text-xl text-ink">{data.gridPercentage}%</p>
            <p className="eyebrow mt-1">Grid mix</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.chargers.map((charger) => (
          <ChargerCard key={charger.id} charger={charger} warehouseId={warehouseId} />
        ))}
      </div>
    </div>
  );
}
