'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { AGENT_ID } from '@/lib/recursiv';
import { Button } from '@/components/primitives/Button';
import { Label } from '@/components/primitives/Label';
import { KpiTile } from '@/components/dashboard/KpiTile';
import { formatCurrency } from '@/lib/utils';

interface Kpi {
  cash?: { total?: number; by_account?: { name: string; balance: number }[] };
  revenue_30d?: { total?: number; by_source?: { source: string; amount: number }[] };
  burn_30d?: { total?: number; by_category?: { category: string; amount: number }[] };
  runway_months?: number;
  shows?: { name: string; revenue_30d?: number; cost_30d?: number; margin?: number }[];
  upcoming_expenses?: { name: string; amount: number; due: string }[];
  as_of?: string;
}

const KPI_PROMPT = `You are returning a JSON snapshot of the COM98 business for a CFO dashboard. Use the tools available to you to get LIVE numbers from connected integrations (banks, QuickBooks, Stripe, Shopify, Gumroad, YouTube). For anything you can't get, set it to null. Return ONLY valid JSON in this exact shape, with no commentary, code fences, or explanation:

{
  "cash": { "total": 0, "by_account": [{"name": "BofA", "balance": 0}] },
  "revenue_30d": { "total": 0, "by_source": [{"source": "Stripe", "amount": 0}] },
  "burn_30d": { "total": 0, "by_category": [{"category": "Payroll", "amount": 0}] },
  "runway_months": 0,
  "shows": [{"name": "Sam Hyde Show", "revenue_30d": 0, "cost_30d": 0, "margin": 0}],
  "upcoming_expenses": [{"name": "...", "amount": 0, "due": "YYYY-MM-DD"}],
  "as_of": "ISO timestamp"
}`;

export default function DashboardPage() {
  const { sdk } = useAuth();
  const [kpi, setKpi] = useState<Kpi>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!sdk) return;
    setLoading(true);
    setError(null);
    try {
      const res = await sdk.agents.chat(AGENT_ID, {
        message: KPI_PROMPT,
        new_conversation: true,
      } as any);
      const content: string = (res as any).data?.content || (res as any).content || '';
      const json = extractJson(content);
      if (!json) throw new Error('Brain returned no parseable data. Try again or check connections.');
      setKpi(json);
    } catch (err: any) {
      setError(err?.message || 'Refresh failed.');
    } finally {
      setLoading(false);
    }
  };

  const runway = kpi.runway_months;
  const runwayStatus =
    runway == null ? 'offline' : runway < 3 ? 'warning' : 'live';

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Label>DASHBOARD</Label>
            <h1 className="text-3xl font-bold mt-1">CONTROL ROOM</h1>
            {kpi.as_of && (
              <div className="text-xs text-muted mt-1 font-mono">
                AS OF {new Date(kpi.as_of).toLocaleString()}
              </div>
            )}
          </div>
          <Button onClick={refresh} loading={loading}>
            {loading ? 'POLLING...' : 'REFRESH FROM BRAIN'}
          </Button>
        </div>

        {error && (
          <div className="text-live text-xs font-mono border border-live/30 bg-live/5 p-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiTile
            label="CASH"
            value={kpi.cash?.total != null ? formatCurrency(kpi.cash.total) : null}
            status={kpi.cash?.total != null ? 'live' : 'offline'}
          >
            {kpi.cash?.by_account?.slice(0, 4).map((a, i) => (
              <div key={i} className="flex justify-between">
                <span className="uppercase tracking-wider text-[10px] text-muted">{a.name}</span>
                <span>{formatCurrency(a.balance)}</span>
              </div>
            ))}
          </KpiTile>

          <KpiTile
            label="REVENUE / 30D"
            value={kpi.revenue_30d?.total != null ? formatCurrency(kpi.revenue_30d.total) : null}
            status={kpi.revenue_30d?.total != null ? 'live' : 'offline'}
          >
            {kpi.revenue_30d?.by_source?.slice(0, 4).map((s, i) => (
              <div key={i} className="flex justify-between">
                <span className="uppercase tracking-wider text-[10px] text-muted">{s.source}</span>
                <span>{formatCurrency(s.amount)}</span>
              </div>
            ))}
          </KpiTile>

          <KpiTile
            label="BURN / 30D"
            value={kpi.burn_30d?.total != null ? formatCurrency(kpi.burn_30d.total) : null}
            status={kpi.burn_30d?.total != null ? 'live' : 'offline'}
          >
            {kpi.burn_30d?.by_category?.slice(0, 4).map((c, i) => (
              <div key={i} className="flex justify-between">
                <span className="uppercase tracking-wider text-[10px] text-muted">{c.category}</span>
                <span>{formatCurrency(c.amount)}</span>
              </div>
            ))}
          </KpiTile>

          <KpiTile
            label="RUNWAY"
            value={runway != null ? `${runway.toFixed(1)} mo` : null}
            subValue={runway != null ? (runway < 3 ? 'CRITICAL' : runway < 6 ? 'WATCH' : 'HEALTHY') : null}
            status={runwayStatus as any}
          />

          <div className="md:col-span-2">
            <KpiTile
              label="TOP SHOWS / 30D"
              value={kpi.shows?.length ? `${kpi.shows.length} ACTIVE` : null}
              status={kpi.shows?.length ? 'live' : 'offline'}
            >
              {kpi.shows?.slice(0, 5).map((s, i) => (
                <div key={i} className="flex justify-between">
                  <span className="uppercase tracking-wider text-[10px] text-muted">{s.name}</span>
                  <span>
                    {s.revenue_30d != null ? formatCurrency(s.revenue_30d) : '—'}
                    {s.margin != null && (
                      <span className="text-muted ml-2">{(s.margin * 100).toFixed(0)}%</span>
                    )}
                  </span>
                </div>
              ))}
            </KpiTile>
          </div>

          <KpiTile
            label="UPCOMING EXPENSES"
            value={kpi.upcoming_expenses?.length ? `${kpi.upcoming_expenses.length} PENDING` : null}
            status={kpi.upcoming_expenses?.length ? 'live' : 'offline'}
          >
            {kpi.upcoming_expenses?.slice(0, 5).map((e, i) => (
              <div key={i} className="flex justify-between">
                <span className="uppercase tracking-wider text-[10px] text-muted truncate pr-2">
                  {e.name}
                </span>
                <span>{formatCurrency(e.amount)}</span>
              </div>
            ))}
          </KpiTile>
        </div>

        {Object.keys(kpi).length === 0 && !loading && (
          <div className="border border-hairline bg-surface p-6 text-secondary text-sm">
            <Label className="mb-2">NO SIGNAL</Label>
            Connect at least one integration in <a href="/settings" className="text-accent underline">/settings</a>{' '}
            then click REFRESH FROM BRAIN. The agent will pull live numbers from anything connected and fill in
            this dashboard.
          </div>
        )}
      </div>
    </div>
  );
}

function extractJson(content: string): any | null {
  if (!content) return null;
  // Prefer JSON in fences if present.
  const fenced = content.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : content;
  // Find the outermost JSON object.
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}
