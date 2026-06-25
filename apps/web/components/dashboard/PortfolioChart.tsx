'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function PortfolioChart({ data }: { data: { name: string; kwh: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="#34383E" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="#9CA3AB" fontSize={11} fontFamily="var(--font-mono)" tickLine={false} axisLine={false} />
        <YAxis stroke="#9CA3AB" fontSize={11} fontFamily="var(--font-mono)" tickLine={false} axisLine={false} width={56} />
        <Tooltip
          contentStyle={{ background: '#1C1F23', border: '1px solid #34383E', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#9CA3AB' }}
          itemStyle={{ color: '#3FBFAE', fontFamily: 'var(--font-mono)' }}
        />
        <Bar dataKey="kwh" fill="#3FBFAE" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
