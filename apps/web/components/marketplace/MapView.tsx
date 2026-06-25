'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Warehouse } from '@/lib/types';
import { useRouter } from 'next/navigation';

export function MapView({ warehouses }: { warehouses: Warehouse[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      // Free, no-token-required dark mode map matching your palette
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-1.8, 52.5],
      zoom: 6,
    });
    
    mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();

    warehouses.forEach((w) => {
      const el = document.createElement('button');
      el.className =
        'flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-bg bg-solar px-1.5 font-mono text-[10px] font-bold text-bg shadow-lg';
      el.innerText = `${w.solarAsset ? Math.round(w.solarAsset.capacityKw / 1000) : 0}MW`;
      el.onclick = () => router.push(`/warehouses/${w.id}`);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([w.longitude, w.latitude])
        .setPopup(new maplibregl.Popup({ offset: 16, closeButton: false }).setText(w.name))
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
      bounds.extend([w.longitude, w.latitude]);
    });

    if (warehouses.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 11, duration: 600 });
    }
  }, [warehouses, router]);

  return <div ref={containerRef} className="h-full min-h-[400px] w-full rounded-lg" />;
}