'use client';

import Link from 'next/link';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioSummary } from '@/components/dashboard/PortfolioSummary';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatGbp, formatKwh, formatPercent } from '@/lib/utils';

export default function DashboardPage() {
  const { data, isLoading, isError } = usePortfolio();

  if (isLoading) return <div className="mx-auto max-w-6xl px-6 py-16 text-ink-muted">Loading portfolio…</div>;
  if (isError || !data) return <div className="mx-auto max-w-6xl px-6 py-16 text-auction">Couldn't load your portfolio.</div>;

  const chartData = data.shares.map((s) => ({ name: s.warehouse.name, kwh: s.annualKwh }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <p className="eyebrow mb-2 text-grid">Investor</p>
      <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">Your energy portfolio</h1>

      <div className="mt-8 space-y-6">
        <PortfolioSummary summary={data.summary} />

        <Card>
          <CardHeader>
            <CardTitle>Entitlement by warehouse</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-muted">No shares yet — browse the marketplace to buy in.</p>
            ) : (
              <PortfolioChart data={chartData} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {data.shares.length === 0 ? (
              <p className="text-sm text-ink-muted">No holdings yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-muted">
                    <th className="pb-2 font-mono text-[11px] uppercase tracking-wide">Warehouse</th>
                    <th className="pb-2 font-mono text-[11px] uppercase tracking-wide">Share</th>
                    <th className="pb-2 font-mono text-[11px] uppercase tracking-wide">Entitlement</th>
                    <th className="pb-2 font-mono text-[11px] uppercase tracking-wide">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {data.shares.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="py-2">
                        <Link href={`/warehouses/${s.warehouse.id}`} className="text-ink hover:text-solar">
                          {s.warehouse.name}
                        </Link>
                      </td>
                      <td className="meter py-2 text-ink">{formatPercent(s.sharePercentage)}</td>
                      <td className="meter py-2 text-ink">{formatKwh(s.annualKwh)}/yr</td>
                      <td className="meter py-2 text-ink">{formatGbp(Number(s.purchasePrice ?? 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
