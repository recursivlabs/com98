'use client';

import { KeyboardEvent, useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface Props {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  size?: 'lg' | 'md';
}

export function ChatInput({ onSubmit, disabled, autoFocus, placeholder = 'ASK THE BRAIN', size = 'md' }: Props) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [value]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className={clsx('w-full bg-surface border border-subtle focus-within:border-accent transition-colors')}>
      <div className="flex items-end gap-2 p-2">
        <textarea
          ref={ref}
          rows={1}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          className={clsx(
            'flex-1 resize-none bg-transparent text-text placeholder:text-muted placeholder:uppercase placeholder:tracking-[0.16em] placeholder:text-[11px]',
            'focus:outline-none px-2 py-2',
            size === 'lg' ? 'text-base' : 'text-sm',
          )}
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          className={clsx(
            'shrink-0 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em]',
            'bg-accent text-bg hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed',
            'transition-colors',
          )}
        >
          SEND
        </button>
      </div>
    </div>
  );
}
