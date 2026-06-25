'use client';

import { useFilterStore } from '@/store/useFilterStore';
import { Input } from '@/components/ui/input';
import { Sun, Zap, PoundSterling, MapPin } from 'lucide-react';

export function SearchFilters() {
  const { filters, setFilter } = useFilterStore();

  return (
    <div className="panel p-5">
      <p className="eyebrow mb-4">Filter listings</p>

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-ink-muted">
            <MapPin className="h-3.5 w-3.5" /> Radius
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={5}
              max={150}
              step={5}
              value={filters.radiusMiles}
              onChange={(e) => setFilter('radiusMiles', Number(e.target.value))}
              className="w-full accent-solar"
            />
            <span className="meter w-16 shrink-0 text-right text-sm text-solar">{filters.radiusMiles}mi</span>
          </div>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-ink-muted">
            <Sun className="h-3.5 w-3.5" /> Min. solar capacity (kW)
          </label>
          <Input
            type="number"
            placeholder="e.g. 500"
            value={filters.minSolarCapacityKw ?? ''}
            onChange={(e) => setFilter('minSolarCapacityKw', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-ink-muted">
            <Zap className="h-3.5 w-3.5" /> Min. EV chargers
          </label>
          <Input
            type="number"
            placeholder="e.g. 4"
            value={filters.minEvChargers ?? ''}
            onChange={(e) => setFilter('minEvChargers', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-ink-muted">
            <PoundSterling className="h-3.5 w-3.5" /> Max internal price (£/kWh)
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="e.g. 0.15"
            value={filters.maxInternalPricePerKwh ?? ''}
            onChange={(e) => setFilter('maxInternalPricePerKwh', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={filters.onlyWithAvailableUnits}
            onChange={(e) => setFilter('onlyWithAvailableUnits', e.target.checked)}
            className="h-4 w-4 accent-solar"
          />
          Units available now
        </label>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={filters.onlyWithEnergyShares}
            onChange={(e) => setFilter('onlyWithEnergyShares', e.target.checked)}
            className="h-4 w-4 accent-solar"
          />
          Energy shares for sale
        </label>
      </div>
    </div>
  );
}
