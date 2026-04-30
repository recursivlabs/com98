'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import type { Recursiv } from '@recursiv/sdk';
import { ORG_ID, AGENT_ID } from '@/lib/recursiv';
import { Label } from '../primitives/Label';
import { formatRelativeDate } from '@/lib/utils';

interface ConvSummary {
  id: string;
  title: string;
  updatedAt: Date;
  bucket: string;
}

const BUCKET_ORDER = ['Today', 'Yesterday', 'This week', 'This month', 'Older'];

export function Sidebar({ sdk, onSignOut, onClose }: { sdk: Recursiv | null; onSignOut: () => void; onClose?: () => void }) {
  const pathname = usePathname();
  const [items, setItems] = useState<ConvSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sdk) return;
    let cancel = false;
    const load = async () => {
      try {
        const res = await sdk.chat.conversations({ limit: 50, organization_id: ORG_ID } as any);
        if (cancel) return;
        const filtered = (res.data || []).filter((c: any) =>
          (c.members || []).some((m: any) => m.id === AGENT_ID || m.username === 'com98'),
        );
        setItems(
          filtered.map((c: any) => {
            const updated = new Date(c.last_message?.created_at || c.created_at);
            return {
              id: c.id,
              title:
                c.name ||
                (c.last_message?.content || '').slice(0, 60) ||
                'New conversation',
              updatedAt: updated,
              bucket: formatRelativeDate(updated),
            };
          }),
        );
      } catch (err: any) {
        console.error('[Sidebar] conversations', err.message);
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 60_000);
    return () => {
      cancel = true;
      clearInterval(t);
    };
  }, [sdk, pathname]);

  const grouped = BUCKET_ORDER.map((bucket) => ({
    bucket,
    items: items.filter((i) => i.bucket === bucket).sort((a, b) => +b.updatedAt - +a.updatedAt),
  })).filter((g) => g.items.length > 0);

  return (
    <aside className="w-72 shrink-0 border-r border-hairline bg-surface flex flex-col h-full">
      <div className="p-4 border-b border-hairline flex items-center justify-between">
        <Link
          href="/"
          onClick={onClose}
          className="block text-[11px] font-bold uppercase tracking-[0.16em] text-accent hover:text-accent-hover"
        >
          + NEW CHAT
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-secondary hover:text-text"
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        <Label className="px-1">HISTORY</Label>
        {loading && <div className="text-muted text-xs px-1">Loading...</div>}
        {!loading && items.length === 0 && (
          <div className="text-muted text-xs px-1">No chats yet. Ask the brain something.</div>
        )}
        {grouped.map((g) => (
          <div key={g.bucket} className="space-y-1">
            <Label className="px-1 text-muted">{g.bucket.toUpperCase()}</Label>
            {g.items.map((item) => {
              const active = pathname === `/chat/${item.id}`;
              return (
                <Link
                  key={item.id}
                  href={`/chat/${item.id}`}
                  onClick={onClose}
                  className={clsx(
                    'block px-2 py-1.5 text-[13px] truncate transition-colors',
                    active
                      ? 'bg-raised text-text border-l-2 border-accent'
                      : 'text-secondary hover:text-text hover:bg-raised',
                  )}
                  title={item.title}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-hairline">
        <button
          onClick={onSignOut}
          className="w-full text-left px-2 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted hover:text-live transition-colors"
        >
          SIGN OUT
        </button>
      </div>
    </aside>
  );
}
