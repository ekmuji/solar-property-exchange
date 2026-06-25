'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { Gavel } from 'lucide-react';
import type { Auction, EnergyShare } from '@/lib/types';
import { formatGbp, formatKwh, formatPercent } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePurchaseShare } from '@/hooks/usePortfolio';

export function OwnershipSection({
  warehouseId,
  shares,
  auctions,
  annualGenerationKwh,
}: {
  warehouseId: string;
  shares: EnergyShare[];
  auctions: Auction[];
  annualGenerationKwh: number;
}) {
  const { isSignedIn } = useAuth();
  const allocatedPct = shares.reduce((sum, s) => sum + s.sharePercentage, 0);
  const availablePct = Math.max(0, 100 - allocatedPct);

  const [pct, setPct] = useState<number>(Math.min(10, availablePct || 10));
  const [price, setPrice] = useState<number>(0);
  const purchase = usePurchaseShare(warehouseId);

  const entitlementKwh = annualGenerationKwh * (pct / 100);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-ink-muted">{formatPercent(allocatedPct, 0)} allocated</span>
            <span className="meter text-solar">{formatPercent(availablePct, 0)} remaining</span>
          </div>
          <Progress value={allocatedPct} />
        </CardContent>
      </Card>

      {auctions.length > 0 && (
        <Card className="border-auction/40">
          <CardContent className="flex items-center justify-between pt-5">
            <div className="flex items-center gap-3">
              <Gavel className="h-5 w-5 text-auction" />
              <div>
                <p className="font-display text-base text-ink">
                  {auctions[0].sharePercentage}% share up for auction
                </p>
                <p className="meter text-sm text-auction">
                  Current bid {formatGbp(Number(auctions[0].currentPrice))}
                </p>
              </div>
            </div>
            <Link href={`/auctions/${auctions[0].id}`}>
              <Button variant="danger" size="sm">View auction</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Owners</CardTitle>
        </CardHeader>
        <CardContent>
          {shares.length === 0 ? (
            <p className="text-sm text-ink-muted">No shares sold yet — this entire array is unallocated.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-muted">
                  <th className="pb-2 font-mono text-[11px] uppercase tracking-wide">Owner</th>
                  <th className="pb-2 font-mono text-[11px] uppercase tracking-wide">Share</th>
                  <th className="pb-2 font-mono text-[11px] uppercase tracking-wide">Entitlement</th>
                  <th className="pb-2 font-mono text-[11px] uppercase tracking-wide">Rate</th>
                </tr>
              </thead>
              <tbody>
                {shares.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="py-2 text-ink">{s.owner?.name ?? 'Unallocated'}</td>
                    <td className="meter py-2 text-ink">{formatPercent(s.sharePercentage)}</td>
                    <td className="meter py-2 text-ink">{formatKwh(s.annualKwh)}/yr</td>
                    <td className="meter py-2 text-solar">{formatGbp(Number(s.internalRatePerKwh), { perKwh: true })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {availablePct > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Buy a share</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-ink-muted">Share percentage (max {availablePct.toFixed(1)}%)</label>
              <Input
                type="number"
                step="0.5"
                min={0.5}
                max={availablePct}
                value={pct}
                onChange={(e) => setPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-ink-muted">Offer price (£)</label>
              <Input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </div>
            <p className="text-sm text-ink-muted">
              Entitles you to <span className="meter text-solar">{formatKwh(entitlementKwh)}</span> per year.
            </p>
            {!isSignedIn ? (
              <p className="text-sm text-ink-muted">Sign in to purchase a share.</p>
            ) : (
              <Button
                className="w-full"
                disabled={purchase.isPending || pct <= 0 || pct > availablePct}
                onClick={() => purchase.mutate({ sharePercentage: pct, purchasePrice: price })}
              >
                {purchase.isPending ? 'Processing…' : `Buy ${pct}% share`}
              </Button>
            )}
            {purchase.isError && <p className="text-sm text-auction">{(purchase.error as Error).message}</p>}
            {purchase.isSuccess && <p className="text-sm text-grid">Share purchased.</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
