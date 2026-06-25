import type { SolarAsset } from '@/lib/types';
import { formatKwh } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductionChart } from './ProductionChart';
import { Sun, Battery, Activity } from 'lucide-react';

export function EnergySection({ solarAsset }: { solarAsset: SolarAsset | null }) {
  if (!solarAsset) {
    return <p className="panel p-6 text-sm text-ink-muted">No solar infrastructure on this listing.</p>;
  }

  const stats = [
    { label: 'Installed capacity', value: `${solarAsset.capacityKw.toLocaleString()} kW`, icon: Sun },
    { label: 'Annual generation', value: formatKwh(solarAsset.annualGenerationKwh), icon: Activity },
    { label: 'Battery storage', value: `${solarAsset.batteryCapacityKwh.toLocaleString()} kWh`, icon: Battery },
    { label: 'Current production', value: `${solarAsset.currentProductionKw.toFixed(0)} kW`, icon: Sun },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <s.icon className="mb-2 h-4 w-4 text-solar" />
              <p className="meter text-xl text-ink">{s.value}</p>
              <p className="eyebrow mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historical production</CardTitle>
        </CardHeader>
        <CardContent>
          {solarAsset.productionHistory && solarAsset.productionHistory.length > 0 ? (
            <ProductionChart data={solarAsset.productionHistory} />
          ) : (
            <p className="py-10 text-center text-sm text-ink-muted">No production history recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
