'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';
import type { ChatMessage } from '@/lib/use-chat';
import { Label } from '../primitives/Label';

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={clsx('w-full py-4', isUser ? 'bg-bg' : 'bg-surface border-y border-hairline')}>
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <Label className={clsx('mb-2', isUser ? 'text-secondary' : 'text-accent')}>
          {isUser ? 'YOU' : 'COM98'}
        </Label>
        <div className="text-text leading-relaxed prose-com98">
          {message.isStreaming && !message.content ? (
            <span className="inline-flex gap-1 items-center">
              <Dot delay="0" />
              <Dot delay="150" />
              <Dot delay="300" />
            </span>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: (props) => <p className="mb-3 last:mb-0" {...props} />,
                ul: (props) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                ol: (props) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                code: ({ inline, children, ...rest }: any) =>
                  inline ? (
                    <code className="font-mono text-accent bg-raised px-1 py-0.5" {...rest}>
                      {children}
                    </code>
                  ) : (
                    <pre className="font-mono text-xs bg-raised border border-hairline p-3 overflow-x-auto my-3">
                      <code {...rest}>{children}</code>
                    </pre>
                  ),
                strong: (props) => <strong className="text-text font-semibold" {...props} />,
                a: (props) => (
                  <a className="text-accent underline underline-offset-2" target="_blank" rel="noreferrer" {...props} />
                ),
                table: (props) => (
                  <div className="overflow-x-auto my-3">
                    <table className="text-xs border border-hairline" {...props} />
                  </div>
                ),
                th: (props) => <th className="border border-hairline px-2 py-1 text-left font-bold" {...props} />,
                td: (props) => <td className="border border-hairline px-2 py-1 font-mono" {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
          {message.isStreaming && message.content && (
            <span className="inline-block w-2 h-4 bg-accent ml-1 align-middle animate-blink" />
          )}
        </div>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="w-1.5 h-1.5 bg-secondary rounded-none animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
