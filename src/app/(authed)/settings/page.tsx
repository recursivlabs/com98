'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { ORG_ID, AGENT_ID } from '@/lib/recursiv';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Label } from '@/components/primitives/Label';

const FEATURED = [
  { provider: 'shopify', name: 'Shopify', desc: 'Merch revenue' },
  { provider: 'quickbooks', name: 'QuickBooks', desc: 'Books + P&L' },
  { provider: 'stripe', name: 'Stripe', desc: 'Payments' },
  { provider: 'gumroad', name: 'Gumroad', desc: 'Digital sales' },
  { provider: 'youtube', name: 'YouTube', desc: 'Channel + ad rev' },
];

interface Connection {
  id: string;
  provider: string;
  display_name?: string;
}

interface AppEntry {
  provider: string;
  name: string;
  category?: string;
}

export default function SettingsPage() {
  const { sdk, signOut, user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [allApps, setAllApps] = useState<AppEntry[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!sdk) return;
    try {
      const res = await sdk.integrations.listConnections(ORG_ID);
      setConnections((res.data as any) || []);
    } catch (err: any) {
      setError(err?.message || 'Could not load connections.');
    }
  };

  useEffect(() => {
    load();
  }, [sdk]);

  useEffect(() => {
    if (!sdk || !showAll) return;
    (async () => {
      try {
        const res = await sdk.integrations.listApps({ search: search.trim() } as any);
        const apps: AppEntry[] = ((res.data as any) || []).map((a: any) => ({
          provider: a.id || a.name?.toLowerCase().replace(/\s+/g, '_'),
          name: a.name || a.id,
          category: a.categories?.[0],
        }));
        setAllApps(apps);
      } catch (err: any) {
        setError(err?.message || 'Could not load app catalog.');
      }
    })();
  }, [sdk, showAll, search]);

  const isConnected = (provider: string) => connections.some((c) => c.provider === provider);
  const connection = (provider: string) => connections.find((c) => c.provider === provider);

  const onConnect = async (provider: string) => {
    if (!sdk) return;
    setBusy(provider);
    setError(null);
    try {
      const redirect = typeof window !== 'undefined' ? window.location.origin + '/settings' : '';
      const res = await sdk.integrations.connect({
        provider,
        organization_id: ORG_ID,
        redirect_url: redirect,
      } as any);
      const data: any = res.data;
      if (data?.already_connected) {
        await load();
        return;
      }
      if (data?.auth_url) {
        const popup = window.open(data.auth_url, '_blank', 'width=600,height=700');
        // Poll: when connection arrives, refresh the list.
        const tick = setInterval(async () => {
          if (popup?.closed) {
            clearInterval(tick);
            await load();
            // Grant the agent access to the new connection.
            const conn = (await sdk.integrations.listConnections(ORG_ID)).data?.find(
              (c: any) => c.provider === provider,
            ) as any;
            if (conn) {
              try {
                await (sdk.integrations as any).updateAgentIntegration?.(AGENT_ID, {
                  user_integration_id: conn.id,
                  enabled: true,
                });
              } catch {}
            }
          }
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || 'Could not start connect.');
    } finally {
      setBusy(null);
    }
  };

  const onDisconnect = async (provider: string) => {
    if (!sdk) return;
    const conn = connection(provider);
    if (!conn) return;
    setBusy(provider);
    try {
      await sdk.integrations.disconnect(conn.id);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not disconnect.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-10">
        <header className="space-y-2">
          <Label>SETTINGS · INTEGRATIONS</Label>
          <h1 className="text-3xl font-bold">CONNECTIONS</h1>
          <p className="text-secondary text-sm">
            Hook the brain into the systems that hold the truth. Once connected, the agent can pull live
            numbers without asking again.
          </p>
        </header>

        {error && (
          <div className="text-live text-xs font-mono border border-live/30 bg-live/5 p-3">{error}</div>
        )}

        <section className="space-y-3">
          <Label>FEATURED</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-hairline border border-hairline">
            {FEATURED.map((f) => {
              const connected = isConnected(f.provider);
              return (
                <div key={f.provider} className="bg-surface p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold">{f.name}</div>
                    <div className="text-xs text-secondary">{f.desc}</div>
                    <div
                      className={`mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase ${
                        connected ? 'text-accent' : 'text-muted'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 ${connected ? 'bg-accent animate-blink' : 'bg-muted'}`}
                      />
                      {connected ? 'CONNECTED' : 'OFFLINE'}
                    </div>
                  </div>
                  <Button
                    variant={connected ? 'secondary' : 'primary'}
                    size="sm"
                    loading={busy === f.provider}
                    onClick={() => (connected ? onDisconnect(f.provider) : onConnect(f.provider))}
                  >
                    {connected ? 'DISCONNECT' : 'CONNECT'}
                  </Button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>MORE FROM COMPOSIO</Label>
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary hover:text-text"
            >
              {showAll ? 'HIDE' : 'EXPAND'}
            </button>
          </div>
          {showAll && (
            <>
              <Input
                placeholder="search 200+ providers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-hairline border border-hairline">
                {allApps
                  .filter((a) => !FEATURED.some((f) => f.provider === a.provider))
                  .slice(0, 60)
                  .map((a) => {
                    const connected = isConnected(a.provider);
                    return (
                      <div
                        key={a.provider}
                        className="bg-surface p-3 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-sm truncate">{a.name}</div>
                          {a.category && (
                            <div className="text-[10px] uppercase tracking-widest text-muted">
                              {a.category}
                            </div>
                          )}
                        </div>
                        <Button
                          variant={connected ? 'secondary' : 'ghost'}
                          size="sm"
                          loading={busy === a.provider}
                          onClick={() =>
                            connected ? onDisconnect(a.provider) : onConnect(a.provider)
                          }
                        >
                          {connected ? 'OFF' : 'ON'}
                        </Button>
                      </div>
                    );
                  })}
              </div>
              {allApps.length === 0 && (
                <div className="text-muted text-xs">No matches.</div>
              )}
            </>
          )}
        </section>

        <section className="space-y-3 pt-6 border-t border-hairline">
          <Label>ACCOUNT</Label>
          <div className="border border-hairline bg-surface p-4 space-y-1">
            <div className="text-sm">{user?.name || '—'}</div>
            <div className="text-xs text-muted font-mono">{user?.email}</div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            SIGN OUT
          </Button>
        </section>
      </div>
    </div>
  );
}
