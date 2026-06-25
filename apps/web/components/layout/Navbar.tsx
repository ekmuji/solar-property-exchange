'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const LINKS = [
  { href: '/', label: 'Marketplace' },
  { href: '/trading', label: 'Trading' },
  { href: '/auctions', label: 'Auctions' },
  { href: '/ev', label: 'EV charging' },
  { href: '/dashboard', label: 'Portfolio' },
  { href: '/owner', label: 'Owner' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-solar text-bg">
            <Zap className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">
            SPX <span className="text-ink-muted font-normal">Solar Property Exchange</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'font-mono text-xs uppercase tracking-wide transition-colors',
                pathname === link.href ? 'text-solar' : 'text-ink-muted hover:text-ink',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
 
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm" variant="outline">Sign in</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
