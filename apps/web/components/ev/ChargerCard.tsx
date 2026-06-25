'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Zap } from 'lucide-react';
import type { EvCharger } from '@/lib/types';
import { formatGbp } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { StatusPill } from '@/components/ui/status-pill';
import { Button } from '@/components/ui/button';
import { useReserveCharger } from '@/hooks/useChargers';

const TYPE_LABEL: Record<string, string> = {
  AC_SLOW: 'AC Slow',
  AC_FAST: 'AC Fast',
  DC_RAPID: 'DC Rapid',
  DC_ULTRA_RAPID: 'DC Ultra-Rapid',
};

export function ChargerCard({ charger, warehouseId }: { charger: EvCharger; warehouseId: string }) {
  const { isSignedIn } = useAuth();
  const [reserved, setReserved] = useState(false);
  const reserve = useReserveCharger(charger.id, warehouseId);

  const handleReserve = () => {
    reserve.mutate(
      { startTime: new Date().toISOString(), durationMinutes: 45 },
      { onSuccess: () => setReserved(true) },
    );
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between pt-5">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Zap className="h-4 w-4 text-solar" />
            <span className="font-display text-base text-ink">{charger.label}</span>
          </div>
          <p className="text-xs text-ink-muted">
            {TYPE_LABEL[charger.chargerType]} · {charger.powerKw}kW
          </p>
          <p className="meter mt-1 text-sm text-solar">{formatGbp(Number(charger.pricePerKwh), { perKwh: true })}</p>
        </div>

        <div className="text-right">
          <StatusPill status={charger.status} />
          {charger.status === 'AVAILABLE' && isSignedIn && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={handleReserve}
              disabled={reserve.isPending || reserved}
            >
              {reserved ? 'Reserved' : reserve.isPending ? 'Reserving…' : 'Reserve'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
