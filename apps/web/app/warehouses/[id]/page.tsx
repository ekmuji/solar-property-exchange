'use client';

import { useParams } from 'next/navigation';
import { MapPin, Sun, PoundSterling } from 'lucide-react';
import { useWarehouse } from '@/hooks/useWarehouses';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PropertySection } from '@/components/warehouse/PropertySection';
import { EnergySection } from '@/components/warehouse/EnergySection';
import { EVSection } from '@/components/warehouse/EVSection';
import { OwnershipSection } from '@/components/warehouse/OwnershipSection';
import { formatGbp } from '@/lib/utils';

export default function WarehouseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: warehouse, isLoading, isError } = useWarehouse(id);

  if (isLoading) return <div className="mx-auto max-w-5xl px-6 py-16 text-ink-muted">Loading…</div>;
  if (isError || !warehouse) {
    return <div className="mx-auto max-w-5xl px-6 py-16 text-auction">Couldn't load this listing.</div>;
  }

  const availableUnits = warehouse.units.filter((u) => u.status === 'AVAILABLE').length;
  const cheapestRate = warehouse.energyShares[0]?.internalRatePerKwh;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <p className="eyebrow mb-2 text-solar">Warehouse</p>
      <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">{warehouse.name}</h1>
      <p className="mt-2 flex items-center gap-1.5 text-ink-muted">
        <MapPin className="h-4 w-4" /> {warehouse.address}
      </p>
      {warehouse.description && <p className="mt-4 max-w-2xl text-ink-muted">{warehouse.description}</p>}

      <div className="mt-6 flex flex-wrap gap-6 border-y border-border py-4">
        <Stat label="Units available" value={`${availableUnits} / ${warehouse.units.length}`} />
        {warehouse.solarAsset && <Stat label="Solar installed" value={`${warehouse.solarAsset.capacityKw.toLocaleString()} kW`} icon={<Sun className="h-3.5 w-3.5 text-solar" />} />}
        {cheapestRate != null && (
          <Stat label="Internal rate" value={formatGbp(Number(cheapestRate), { perKwh: true })} icon={<PoundSterling className="h-3.5 w-3.5 text-solar" />} />
        )}
        <Stat label="Grid rate (ref.)" value="£0.24/kWh" />
      </div>

      <Tabs defaultValue="property" className="mt-8">
        <TabsList>
          <TabsTrigger value="property">Property</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="ev">EV charging</TabsTrigger>
          <TabsTrigger value="ownership">Ownership</TabsTrigger>
        </TabsList>

        <TabsContent value="property" className="pt-6">
          <PropertySection units={warehouse.units} />
        </TabsContent>
        <TabsContent value="energy" className="pt-6">
          <EnergySection solarAsset={warehouse.solarAsset} />
        </TabsContent>
        <TabsContent value="ev" className="pt-6">
          <EVSection warehouseId={warehouse.id} />
        </TabsContent>
        <TabsContent value="ownership" className="pt-6">
          <OwnershipSection
            warehouseId={warehouse.id}
            shares={warehouse.energyShares}
            auctions={warehouse.auctions ?? []}
            annualGenerationKwh={warehouse.solarAsset?.annualGenerationKwh ?? 0}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-1">{label}</p>
      <p className="meter flex items-center gap-1.5 text-base text-ink">
        {icon} {value}
      </p>
    </div>
  );
}
