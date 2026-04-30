'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Label } from '../primitives/Label';

interface Props {
  onMenuClick?: () => void;
}

const navItems = [
  { href: '/', label: 'CHAT' },
  { href: '/dashboard', label: 'DASHBOARD' },
  { href: '/settings', label: 'SETTINGS' },
];

export function TopBar({ onMenuClick }: Props) {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-30 border-b border-hairline bg-bg">
      <div className="flex h-12 items-center px-4 md:px-6">
        <button
          onClick={onMenuClick}
          className="md:hidden mr-3 text-secondary hover:text-text"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>

        <Link href="/" className="flex items-center gap-3 mr-8">
          <span className="font-bold text-accent text-xl tracking-[0.18em]">COM98</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 flex-1">
          {navItems.map((item) => {
            const active = item.href === '/'
              ? pathname === '/' || pathname.startsWith('/chat')
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'text-[11px] font-bold uppercase tracking-[0.16em] transition-colors',
                  active ? 'text-accent' : 'text-secondary hover:text-text',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden md:flex items-center gap-2">
            <span className="w-2 h-2 bg-live animate-blink" />
            <Label className="text-live">LIVE</Label>
          </span>
        </div>
      </div>
    </div>
  );
}
