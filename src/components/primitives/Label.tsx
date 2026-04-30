import clsx from 'clsx';
import { HTMLAttributes } from 'react';

export function Label({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'font-bold uppercase tracking-[0.16em] text-[11px] leading-[14px] text-secondary',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
