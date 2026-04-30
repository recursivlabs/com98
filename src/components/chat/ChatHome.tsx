'use client';

import { useRouter } from 'next/navigation';
import { ChatInput } from './ChatInput';
import { Label } from '../primitives/Label';

const SUGGESTIONS = [
  "What's our cash position right now",
  "Are You OK profitable last month?",
  "How are ad sponsors trending",
  "What's overdue or coming due",
  "Show me revenue per show last 30 days",
  "Who haven't we paid this week",
];

export function ChatHome() {
  const router = useRouter();

  const start = (msg: string) => {
    const url = `/chat/new?message=${encodeURIComponent(msg)}`;
    router.push(url);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-10">
        <div className="text-center space-y-3">
          <div className="font-bold text-accent text-5xl md:text-7xl tracking-[0.18em]">COM98</div>
          <Label className="text-muted">BRAIN</Label>
        </div>

        <ChatInput onSubmit={start} autoFocus size="lg" placeholder="ASK ANYTHING ABOUT COM98" />

        <div className="space-y-3">
          <Label className="text-muted">SUGGESTED</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => start(s)}
                className="text-left px-3 py-2.5 border border-hairline text-secondary hover:border-accent hover:text-text transition-colors text-sm"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
