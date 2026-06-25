'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { ProductionRecord } from '@/lib/types';

export function ProductionChart({ data }: { data: ProductionRecord[] }) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    kWh: Math.round(d.generatedKwh),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="solarFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F2A93B" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#F2A93B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#34383E" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" stroke="#9CA3AB" fontSize={11} fontFamily="var(--font-mono)" tickLine={false} axisLine={false} />
        <YAxis stroke="#9CA3AB" fontSize={11} fontFamily="var(--font-mono)" tickLine={false} axisLine={false} width={56} />
        <Tooltip
          contentStyle={{ background: '#1C1F23', border: '1px solid #34383E', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#9CA3AB' }}
          itemStyle={{ color: '#F2A93B', fontFamily: 'var(--font-mono)' }}
        />
        <Area type="monotone" dataKey="kWh" stroke="#F2A93B" strokeWidth={2} fill="url(#solarFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
