'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useOrderBook, usePlaceOrder } from '@/hooks/useOrderBook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatGbp } from '@/lib/utils';
import type { TradeSide } from '@/lib/types';

export function TradingPanel({ warehouseId }: { warehouseId?: string }) {
  const { isSignedIn } = useAuth();
  const { data, isLoading } = useOrderBook(warehouseId);
  const placeOrder = usePlaceOrder(warehouseId);

  const [side, setSide] = useState<TradeSide>('BUY');
  const [quantity, setQuantity] = useState(1000);
  const [price, setPrice] = useState(0.12);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle>Order book</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-ink-muted">Loading…</p>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="eyebrow mb-2 text-grid">Bids (buy)</p>
                <OrderList side="BUY" orders={data?.buys ?? []} />
              </div>
              <div>
                <p className="eyebrow mb-2 text-auction">Asks (sell)</p>
                <OrderList side="SELL" orders={data?.sells ?? []} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Place order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button variant={side === 'BUY' ? 'grid' : 'outline'} onClick={() => setSide('BUY')} size="sm">Buy</Button>
            <Button variant={side === 'SELL' ? 'danger' : 'outline'} onClick={() => setSide('SELL')} size="sm">Sell</Button>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-ink-muted">Quantity (kWh)</label>
            <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-ink-muted">Price (£/kWh)</label>
            <Input type="number" step="0.001" min={0.0001} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
          {!isSignedIn ? (
            <p className="text-sm text-ink-muted">Sign in to trade.</p>
          ) : (
            <Button
              className="w-full"
              variant={side === 'BUY' ? 'grid' : 'danger'}
              disabled={placeOrder.isPending}
              onClick={() => placeOrder.mutate({ side, quantityKwh: quantity, pricePerKwh: price })}
            >
              {placeOrder.isPending ? 'Submitting…' : `${side === 'BUY' ? 'Buy' : 'Sell'} ${quantity.toLocaleString()} kWh`}
            </Button>
          )}
          {placeOrder.isSuccess && (placeOrder.data as any)?.fills?.length > 0 && (
            <p className="text-sm text-grid">Matched {(placeOrder.data as any).fills.length} fill(s) instantly.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OrderList({ orders, side }: { orders: any[]; side: TradeSide }) {
  if (orders.length === 0) return <p className="text-sm text-ink-muted">No open orders.</p>;
  return (
    <ul className="space-y-1.5">
      {orders.slice(0, 8).map((o) => (
        <li key={o.id} className="flex items-center justify-between text-sm">
          <span className={side === 'BUY' ? 'meter text-grid' : 'meter text-auction'}>
            {formatGbp(Number(o.pricePerKwh), { perKwh: true })}
          </span>
          <span className="meter text-ink-muted">{(o.quantityKwh - o.filledKwh).toLocaleString()} kWh</span>
        </li>
      ))}
    </ul>
  );
}
