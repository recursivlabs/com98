'use client';

import { useEffect, useRef } from 'react';
import { ChatBubble } from './ChatBubble';
import type { ChatMessage } from '@/lib/use-chat';

export function ChatThread({ messages }: { messages: ChatMessage[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((m) => (
        <ChatBubble key={m.id} message={m} />
      ))}
      <div ref={endRef} className="h-32" />
    </div>
  );
}
