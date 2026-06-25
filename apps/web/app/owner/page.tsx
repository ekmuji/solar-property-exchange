'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Warehouse } from '@/lib/types';

export default function OwnerPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', address: '', latitude: '', longitude: '', description: '' });

  const createWarehouse = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return api.post<Warehouse>(
        '/warehouses',
        {
          name: form.name,
          address: form.address,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          description: form.description || undefined,
        },
        token,
      );
    },
    onSuccess: (warehouse) => router.push(`/warehouses/${warehouse.id}`),
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <p className="eyebrow mb-2 text-solar">Owner</p>
      <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">List a warehouse</h1>
      <p className="mt-3 text-ink-muted">
        Once created, add units, a solar asset, and EV chargers via the API — see the{' '}
        <code className="font-mono text-xs">README.md</code> for the full endpoint reference.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Listing details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Name">
            <Input value={form.name} onChange={set('name')} placeholder="Warehouse Alpha" />
          </Field>
          <Field label="Address">
            <Input value={form.address} onChange={set('address')} placeholder="Tyburn Road, Birmingham" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude">
              <Input value={form.latitude} onChange={set('latitude')} placeholder="52.5121" />
            </Field>
            <Field label="Longitude">
              <Input value={form.longitude} onChange={set('longitude')} placeholder="-1.8175" />
            </Field>
          </div>
          <Field label="Description">
            <Input value={form.description} onChange={set('description')} placeholder="1.2MW rooftop array, EV chargers on site…" />
          </Field>

          <Button
            className="w-full"
            disabled={createWarehouse.isPending || !form.name || !form.address || !form.latitude || !form.longitude}
            onClick={() => createWarehouse.mutate()}
          >
            {createWarehouse.isPending ? 'Creating…' : 'Create listing'}
          </Button>
          {createWarehouse.isError && <p className="text-sm text-auction">{(createWarehouse.error as Error).message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-ink-muted">{label}</label>
      {children}
    </div>
  );
}
