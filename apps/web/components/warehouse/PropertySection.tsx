import type { WarehouseUnit } from '@/lib/types';
import { formatGbp } from '@/lib/utils';
import { StatusPill } from '@/components/ui/status-pill';

export function PropertySection({ units }: { units: WarehouseUnit[] }) {
  return (
    <div className="panel overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-ink-muted">Unit</th>
            <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-ink-muted">Sq ft</th>
            <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-ink-muted">Monthly rent</th>
            <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-ink-muted">Status</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit) => (
            <tr key={unit.id} className="border-b border-border last:border-0">
              <td className="px-5 py-3 text-ink">{unit.unitNumber}</td>
              <td className="meter px-5 py-3 text-ink">{unit.sqft.toLocaleString()}</td>
              <td className="meter px-5 py-3 text-ink">{formatGbp(Number(unit.monthlyRent))}/mo</td>
              <td className="px-5 py-3">
                <StatusPill status={unit.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
