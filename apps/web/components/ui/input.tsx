import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded border border-border bg-surface2 px-3 text-sm text-ink placeholder:text-ink-muted',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-solar',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
