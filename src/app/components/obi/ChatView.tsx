import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, BarChart3, TrendingUp, Zap, FileText, Microscope,
} from 'lucide-react';
import {
  CHAT_CATEGORIES,
  CHAT_DEMO_SEED,
  getObiResponse,
} from '../../../data/obi-intelligence';
import type { ChatCategoryId } from '../../../data/obi-intelligence';
import { INTEL } from './tokens';
import { HeroText, HeroSubtext, IntelTag, IntelInput } from './shared/intelUi';
import { ObiMessage, UserMessage } from './shared/ObiMessage';

const CATEGORY_ICONS: Record<ChatCategoryId, React.ReactNode> = {
  diagnose: <Search size={16} />,
  benchmark: <BarChart3 size={16} />,
  project: <TrendingUp size={16} />,
  activate: <Zap size={16} />,
  report: <FileText size={16} />,
  investigate: <Microscope size={16} />,
};

type ChatItem =
  | { type: 'user'; text: string }
  | { type: 'obi'; text: string };

export function ChatView({
  prefill,
  onPrefillConsumed,
  showDemo = true,
}: {
  prefill?: string | null;
  onPrefillConsumed?: () => void;
  showDemo?: boolean;
}) {
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [input, setInput] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<ChatCategoryId | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const demoSeeded = useRef(false);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, { type: 'user', text: trimmed }, { type: 'obi', text: trimmed }]);
    setInput('');
    setExpandedCategory(null);
  }, []);

  useEffect(() => {
    if (showDemo && !demoSeeded.current && !prefill && messages.length === 0) {
      demoSeeded.current = true;
      setMessages([
        { type: 'user', text: CHAT_DEMO_SEED.userMessage },
        { type: 'obi', text: CHAT_DEMO_SEED.userMessage },
      ]);
    }
  }, [showDemo, prefill, messages.length]);

  useEffect(() => {
    if (!prefill) return;
    sendMessage(prefill);
    onPrefillConsumed?.();
  }, [prefill]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-12rem)] pb-8">
      <HeroText>Ask anything about your team.</HeroText>
      <HeroSubtext>
        Obi answers with your live data + published research. Every response cites its sources.
      </HeroSubtext>

      <div className="mt-8 mb-6">
        <IntelTag text="What to ask Obi" />
        <div className="grid grid-cols-3 gap-2">
          {CHAT_CATEGORIES.map(cat => (
            <div key={cat.id}>
              <button
                type="button"
                onClick={() =>
                  setExpandedCategory(expandedCategory === cat.id ? null : cat.id)
                }
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-colors"
                style={{
                  backgroundColor:
                    expandedCategory === cat.id ? INTEL.surface : 'transparent',
                  borderColor: INTEL.border,
                  color: expandedCategory === cat.id ? INTEL.text : INTEL.muted,
                }}
              >
                <span style={{ color: INTEL.accent }}>{CATEGORY_ICONS[cat.id]}</span>
                {cat.label}
              </button>
              {expandedCategory === cat.id && (
                <div className="flex flex-col gap-1.5 mt-2">
                  {cat.prompts.map(prompt => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="text-left px-3 py-2 rounded-full text-[11px] border transition-colors hover:opacity-90"
                      style={{ borderColor: INTEL.border, color: INTEL.muted }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto space-y-4 pr-2 mb-6 min-h-[200px]">
        {messages.map((m, i) =>
          m.type === 'user' ? (
            <UserMessage key={i} text={m.text} />
          ) : (
            <ObiMessage
              key={i}
              response={getObiResponse(m.text, 'leader')}
              onFollowUp={sendMessage}
            />
          )
        )}
      </div>

      <div className="flex-none border-t pt-4" style={{ borderColor: INTEL.border }}>
        <IntelInput
          value={input}
          onChange={setInput}
          onSubmit={() => sendMessage(input)}
          placeholder="Ask about your team, benchmark against the industry, or generate a report..."
        />
        <p className="text-[10px] mt-2 text-center" style={{ color: INTEL.muted }}>
          Obi merges live data with McKinsey · Microsoft · WEF · Harvard · Nielsen Norman
        </p>
      </div>
    </div>
  );
}
