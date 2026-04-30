'use client';

import { useCallback, useRef, useState } from 'react';
import type { Recursiv } from '@recursiv/sdk';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  createdAt: Date;
}

function stripFences(text: string): string {
  return text
    .replace(/```(?:json|javascript|js|typescript|ts|action)?\s*\n([\s\S]*?)```/g, '$1')
    .trim();
}

export function useChat(sdk: Recursiv | null, agentId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const convRef = useRef<string | null>(null);

  const send = useCallback(
    async (text: string, opts?: { newConversation?: boolean }): Promise<string | null> => {
      if (!sdk || isStreaming || !text.trim()) return null;

      const userMsg: ChatMessage = {
        id: 'u-' + Date.now(),
        role: 'user',
        content: text,
        createdAt: new Date(),
      };
      const assistantId = 'a-' + Date.now();
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: 'assistant', content: '', isStreaming: true, createdAt: new Date() },
      ]);
      setIsStreaming(true);

      try {
        const useNew = opts?.newConversation || !convRef.current;
        const stream = sdk.agents.chatStream(agentId, {
          message: text,
          ...(useNew ? { new_conversation: true } : { conversation_id: convRef.current! }),
        });

        let acc = '';
        let convId: string | null = null;
        for await (const chunk of stream as AsyncGenerator<any>) {
          if (chunk?.conversation_id && !convId) {
            convId = chunk.conversation_id;
          }
          if (chunk?.type === 'text_delta' && typeof chunk.delta === 'string') {
            acc += chunk.delta;
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)),
            );
          } else if (chunk?.type === 'done') {
            break;
          } else if (chunk?.type === 'error') {
            throw new Error(chunk.error || 'Stream error');
          }
        }

        const cleaned = stripFences(acc);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: cleaned, isStreaming: false } : m,
          ),
        );

        if (convId) {
          convRef.current = convId;
          setConversationId(convId);
        }
        return convId;
      } catch (err: any) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: 'SIGNAL LOST: ' + (err.message || 'unknown error'), isStreaming: false }
              : m,
          ),
        );
        return convRef.current;
      } finally {
        setIsStreaming(false);
      }
    },
    [sdk, agentId, isStreaming],
  );

  const loadConversation = useCallback(
    async (id: string) => {
      if (!sdk || !id) return;
      try {
        const res = await sdk.chat.messages(id, { limit: 100 });
        const loaded: ChatMessage[] = (res.data || [])
          .slice()
          .reverse()
          .map((m: any): ChatMessage => ({
            id: m.id,
            role: m.sender?.is_ai ? 'assistant' : 'user',
            content: stripFences(m.content || ''),
            createdAt: new Date(m.created_at),
          }))
          .filter((m: ChatMessage) => m.content.length > 0);
        setMessages(loaded);
        setConversationId(id);
        convRef.current = id;
      } catch (err: any) {
        console.error('[useChat] loadConversation', err.message);
      }
    },
    [sdk],
  );

  const reset = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    convRef.current = null;
  }, []);

  return { messages, isStreaming, conversationId, send, loadConversation, reset };
}
