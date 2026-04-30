export { default as clsx } from 'clsx';

export function formatRelativeDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  if (d > oneWeekAgo) return 'This week';
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(now.getMonth() - 1);
  if (d > oneMonthAgo) return 'This month';
  return 'Older';
}

export function formatCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}
