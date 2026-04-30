import clsx from 'clsx';
import { Label } from '../primitives/Label';

interface Props {
  label: string;
  value: string | null;
  subValue?: string | null;
  status?: 'live' | 'offline' | 'warning';
  className?: string;
  children?: React.ReactNode;
}

export function KpiTile({ label, value, subValue, status = 'live', className, children }: Props) {
  const statusColor =
    status === 'offline' ? 'text-muted' : status === 'warning' ? 'text-live' : 'text-accent';
  const statusText = status === 'offline' ? 'NO SIGNAL' : status === 'warning' ? 'ALERT' : 'LIVE';

  return (
    <div className={clsx('border border-hairline bg-surface p-5 flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className={clsx('text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-1.5', statusColor)}>
          {status !== 'offline' && (
            <span
              className={clsx(
                'w-1.5 h-1.5',
                status === 'warning' ? 'bg-live animate-blink' : 'bg-accent animate-blink',
              )}
            />
          )}
          {statusText}
        </span>
      </div>

      <div className="font-mono tabular-nums">
        {value ? (
          <div className="text-3xl md:text-4xl text-text font-bold tracking-tight">{value}</div>
        ) : (
          <div className="text-muted text-sm">— — —</div>
        )}
        {subValue && <div className="text-xs text-secondary mt-1">{subValue}</div>}
      </div>

      {children && <div className="text-xs text-secondary space-y-1 pt-2 border-t border-hairline">{children}</div>}
    </div>
  );
}
