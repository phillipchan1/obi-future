import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MY_VIEW_CARDS,
  MY_VIEW_CHAT_PROMPTS,
  MY_VIEW_PERSONA,
  getObiResponse,
} from '../../../data/obi-intelligence';
import { INTEL } from './tokens';
import { HeroText, SeverityPill, SourceLine, IntelInput } from './shared/intelUi';
import { ObiMessage, UserMessage } from './shared/ObiMessage';

type ChatItem =
  | { type: 'user'; text: string }
  | { type: 'obi'; text: string };

export function MyView() {
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, { type: 'user', text: trimmed }, { type: 'obi', text: trimmed }]);
    setInput('');
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="space-y-8 pb-12 max-w-3xl">
      <h1
        className="font-bold leading-tight bg-gradient-to-r from-violet-300 via-purple-200 to-indigo-300 bg-clip-text text-transparent"
        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
      >
        Here&apos;s what matters for you, {MY_VIEW_PERSONA.firstName}.
      </h1>

      <div className="space-y-4">
        {MY_VIEW_CARDS.map(card => (
          <div
            key={card.id}
            className="p-6 border-l-4"
            style={{
              backgroundColor: card.bgColor,
              borderLeftColor: card.borderColor,
              borderTop: `1px solid ${INTEL.border}`,
              borderRight: `1px solid ${INTEL.border}`,
              borderBottom: `1px solid ${INTEL.border}`,
            }}
          >
            <SeverityPill
              label={card.tag}
              color={card.borderColor}
            />
            <h3 className="text-lg font-bold text-white mt-3 mb-3 leading-snug">{card.headline}</h3>
            <p className="text-[15px] leading-relaxed" style={{ color: INTEL.textBody }}>
              {card.body}
            </p>
            <SourceLine text={card.source} />
          </div>
        ))}
      </div>

      <div>
        <h2
          className="font-bold text-white mb-4"
          style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}
        >
          Ask Obi about your journey
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {MY_VIEW_CHAT_PROMPTS.map(prompt => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="px-3 py-2 rounded-full text-[11px] border transition-colors hover:opacity-90"
              style={{ borderColor: INTEL.border, color: INTEL.accentBlue }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {messages.length > 0 && (
          <div ref={listRef} className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
            {messages.map((m, i) =>
              m.type === 'user' ? (
                <UserMessage key={i} text={m.text} />
              ) : (
                <ObiMessage
                  key={i}
                  response={getObiResponse(m.text, 'employee')}
                  onFollowUp={sendMessage}
                />
              )
            )}
          </div>
        )}

        <IntelInput
          value={input}
          onChange={setInput}
          onSubmit={() => sendMessage(input)}
          placeholder="Ask anything about your readiness..."
        />
      </div>
    </div>
  );
}
