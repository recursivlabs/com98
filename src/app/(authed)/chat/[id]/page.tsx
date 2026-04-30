'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useChat } from '@/lib/use-chat';
import { AGENT_ID } from '@/lib/recursiv';
import { ChatThread } from '@/components/chat/ChatThread';
import { ChatInput } from '@/components/chat/ChatInput';

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const { sdk, isAuthenticated } = useAuth();
  const { messages, isStreaming, send, loadConversation } = useChat(sdk, AGENT_ID);
  const initialMessageRef = useRef<string | null>(params.get('message'));
  const sentInitialRef = useRef(false);

  // Existing conversation: hydrate messages.
  useEffect(() => {
    if (!isAuthenticated || !sdk) return;
    if (id !== 'new') {
      loadConversation(id);
    }
  }, [id, isAuthenticated, sdk, loadConversation]);

  // New conversation with initial message from query string.
  useEffect(() => {
    if (!isAuthenticated || !sdk) return;
    if (id !== 'new') return;
    if (sentInitialRef.current) return;
    const initial = initialMessageRef.current;
    if (!initial) {
      router.replace('/');
      return;
    }
    sentInitialRef.current = true;
    (async () => {
      const newId = await send(initial, { newConversation: true });
      if (newId) router.replace(`/chat/${newId}`);
    })();
  }, [id, isAuthenticated, sdk, router, send]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ChatThread messages={messages} />
      <div className="border-t border-hairline bg-bg p-3 md:p-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSubmit={(msg) => send(msg)}
            disabled={isStreaming || id === 'new'}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
