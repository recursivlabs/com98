'use client';

import clsx from 'clsx';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-sm',
};

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-bg hover:bg-accent-hover disabled:opacity-50',
  secondary:
    'bg-transparent text-text border border-subtle hover:border-text disabled:opacity-50',
  ghost:
    'bg-transparent text-secondary hover:text-text disabled:opacity-50',
  danger:
    'bg-live text-bg hover:opacity-90 disabled:opacity-50',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-bold uppercase tracking-[0.12em] transition-colors',
        'focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed',
        sizes[size],
        variants[variant],
        className,
      )}
      {...rest}
    >
      {loading ? <span className="animate-pulse">...</span> : children}
    </button>
  );
});
