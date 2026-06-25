import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded font-body font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none',
  {
    variants: {
      variant: {
        solar: 'bg-solar text-bg hover:bg-solar/90',
        grid: 'bg-grid text-bg hover:bg-grid/90',
        outline: 'border border-border bg-transparent text-ink hover:bg-surface2',
        ghost: 'bg-transparent text-ink hover:bg-surface2',
        danger: 'bg-auction text-ink hover:bg-auction/90',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'solar', size: 'md' },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = 'Button';
