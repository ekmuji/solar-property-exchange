import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  AVAILABLE: { dot: 'bg-grid', text: 'text-grid' },
  RESERVED: { dot: 'bg-solar', text: 'text-solar' },
  LEASED: { dot: 'bg-ink-muted', text: 'text-ink-muted' },
  OCCUPIED: { dot: 'bg-ink-muted', text: 'text-ink-muted' },
  AUCTIONING: { dot: 'bg-auction', text: 'text-auction' },
  LIVE: { dot: 'bg-auction animate-pulseDot', text: 'text-auction' },
  SOLD: { dot: 'bg-ink-muted', text: 'text-ink-muted' },
  ENDED: { dot: 'bg-ink-muted', text: 'text-ink-muted' },
  OFFLINE: { dot: 'bg-ink-muted/50', text: 'text-ink-muted' },
};

export function StatusPill({ status, label }: { status: string; label?: string }) {
  const style = STATUS_STYLES[status] ?? { dot: 'bg-ink-muted', text: 'text-ink-muted' };
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide', style.text)}>
      <span className={cn('status-dot', style.dot)} />
      {label ?? status.replace('_', ' ').toLowerCase()}
    </span>
  );
}
