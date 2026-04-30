'use client';

import clsx from 'clsx';
import { InputHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={clsx(
          'w-full bg-surface text-text placeholder:text-muted',
          'border border-subtle px-3 py-2 text-sm font-mono',
          'focus:outline-none focus:border-accent transition-colors',
          className,
        )}
        {...rest}
      />
    );
  },
);
