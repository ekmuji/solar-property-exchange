import Link from 'next/link';
import { Sun, Zap, MapPin, Building2 } from 'lucide-react';
import type { Warehouse } from '@/lib/types';
import { formatGbp, formatKwh } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function WarehouseCard({ warehouse }: { warehouse: Warehouse }) {
  const availableUnits = warehouse.units.filter((u) => u.status === 'AVAILABLE').length;
  const allocatedPct = warehouse.energyShares.reduce((sum, s) => sum + s.sharePercentage, 0);
  const sharesAvailablePct = Math.max(0, 100 - allocatedPct);
  const cheapestRate = warehouse.energyShares[0]?.internalRatePerKwh;
  const availableChargers = warehouse.evChargers.filter((c) => c.status === 'AVAILABLE').length;

  return (
    <Link href={`/warehouses/${warehouse.id}`}>
      <Card className="group h-full transition-colors hover:border-solar/50">
        <div className="relative h-36 overflow-hidden rounded-t-lg bg-surface2">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(242,169,59,0.18),transparent_60%)]" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div>
              <p className="eyebrow text-solar">{warehouse.solarAsset ? `${warehouse.solarAsset.capacityKw.toLocaleString()} kW installed` : 'No solar'}</p>
              <h3 className="font-display text-xl font-medium text-ink">{warehouse.name}</h3>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <p className="flex items-center gap-1.5 text-sm text-ink-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {warehouse.address}
          </p>

          <div className="grid grid-cols-3 gap-3 border-y border-border py-3">
            <div>
              <p className="eyebrow mb-1">Units</p>
              <p className="meter flex items-center gap-1 text-sm text-ink">
                <Building2 className="h-3.5 w-3.5 text-grid" /> {availableUnits}/{warehouse.units.length}
              </p>
            </div>
            <div>
              <p className="eyebrow mb-1">Annual gen.</p>
              <p className="meter text-sm text-ink">{warehouse.solarAsset ? formatKwh(warehouse.solarAsset.annualGenerationKwh) : '—'}</p>
            </div>
            <div>
              <p className="eyebrow mb-1">EV chargers</p>
              <p className="meter flex items-center gap-1 text-sm text-ink">
                <Zap className="h-3.5 w-3.5 text-solar" /> {availableChargers}/{warehouse.evChargers.length}
              </p>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="eyebrow">Energy shares remaining</p>
              <p className="meter text-xs text-solar">{sharesAvailablePct.toFixed(0)}%</p>
            </div>
            <Progress value={100 - sharesAvailablePct} />
          </div>

          {cheapestRate != null && (
            <p className="flex items-center gap-1.5 text-sm">
              <Sun className="h-3.5 w-3.5 text-solar" />
              <span className="meter text-ink">{formatGbp(Number(cheapestRate), { perKwh: true })}</span>
              <span className="text-ink-muted">internal rate</span>
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
