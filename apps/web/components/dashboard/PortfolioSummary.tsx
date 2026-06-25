import { PoundSterling, Zap, PieChart, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatGbp, formatKwh } from '@/lib/utils';

export function PortfolioSummary({
  summary,
}: {
  summary: { sharesOwned: number; currentValue: number; revenueGenerated: number; annualKwhEntitlement: number };
}) {
  const stats = [
    { label: 'Shares owned', value: String(summary.sharesOwned), icon: PieChart },
    { label: 'Portfolio value', value: formatGbp(summary.currentValue), icon: PoundSterling },
    { label: 'Revenue generated', value: formatGbp(summary.revenueGenerated), icon: TrendingUp },
    { label: 'Annual kWh entitlement', value: formatKwh(summary.annualKwhEntitlement), icon: Zap },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
  );
}
