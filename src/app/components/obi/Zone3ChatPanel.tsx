import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Search, BarChart3, TrendingUp, Zap, FileText, Microscope, ChevronUp } from 'lucide-react';
import {
  CHAT_CATEGORIES,
  getObiResponse,
} from '../../../data/obi-intelligence';
import type { ChatCategoryId } from '../../../data/obi-intelligence';
import { INTEL } from './tokens';
import { ZoneWatermark } from './shared/glass';
import { ObiMessage, UserMessage } from './shared/ObiMessage';

const CATEGORY_ICONS: Record<ChatCategoryId, React.ReactNode> = {
  diagnose: <Search size={14} />,
  benchmark: <BarChart3 size={14} />,
  project: <TrendingUp size={14} />,
  activate: <Zap size={14} />,
  report: <FileText size={14} />,
  investigate: <Microscope size={14} />,
};

type ChatItem = { type: 'user'; text: string } | { type: 'obi'; query: string };

export function Zone3ChatPanel({
  expanded,
  onToggle,
  prefill,
  onPrefillConsumed,
  mode = 'leader',
}: {
  expanded: boolean;
  onToggle: () => void;
  prefill?: string | null;
  onPrefillConsumed?: () => void;
  mode?: 'leader' | 'employee';
}) {
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [input, setInput] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<ChatCategoryId | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (!expanded) onToggle();
      setMessages(prev => [...prev, { type: 'user', text: trimmed }, { type: 'obi', query: trimmed }]);
      setInput('');
      setExpandedCategory(null);
    },
    [expanded, onToggle]
  );

  const prefillSent = useRef<string | null>(null);
  useEffect(() => {
    if (!prefill || !expanded) return;
    if (prefillSent.current === prefill) return;
    prefillSent.current = prefill;
    sendMessage(prefill);
    onPrefillConsumed?.();
  }, [prefill, expanded, sendMessage, onPrefillConsumed]);

  useEffect(() => {
    if (expanded) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, expanded]);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 border-t transition-all relative overflow-hidden"
        style={{
          height: '56px',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <ZoneWatermark word="ASK" />
        <span className="relative z-10 flex items-center gap-2 text-sm" style={{ color: INTEL.text }}>
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: INTEL.accent }}
          >
            <Bot size={14} className="text-white" />
          </span>
          Ask Obi anything about your team...
        </span>
        <span className="relative z-10 text-xs font-semibold" style={{ color: INTEL.muted }}>
          ↑ Expand
        </span>
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex flex-col border-t transition-all duration-300 ease-out relative overflow-hidden"
      style={{
        height: '50vh',
        background: 'rgba(13, 6, 22, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'rgba(255,255,255,0.1)',
      }}
    >
      <ZoneWatermark word="ASK" />
      <button
        type="button"
        onClick={onToggle}
        className="relative z-10 flex items-center justify-between px-6 py-3 flex-none border-b w-full"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: INTEL.muted }}>
          What to ask Obi
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: INTEL.muted }}>
          <ChevronUp size={14} /> Collapse
        </span>
      </button>

      <div className="relative z-10 flex-none px-4 py-3 border-b overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="grid grid-cols-3 gap-2 min-w-[320px]">
          {CHAT_CATEGORIES.map(cat => (
            <div key={cat.id}>
              <button
                type="button"
                onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                className="w-full flex items-center gap-1.5 px-2 py-2 rounded-lg border text-[11px] font-medium"
                style={{
                  borderColor: 'rgba(255,255,255,0.12)',
                  color: expandedCategory === cat.id ? INTEL.text : INTEL.muted,
                  background: expandedCategory === cat.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                }}
              >
                {CATEGORY_ICONS[cat.id]}
                {cat.label}
              </button>
              {expandedCategory === cat.id && (
                <div className="flex flex-col gap-1 mt-1">
                  {cat.prompts.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => sendMessage(p)}
                      className="text-left px-2 py-1.5 rounded text-[10px] border"
                      style={{ borderColor: 'rgba(255,255,255,0.1)', color: INTEL.muted }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div ref={listRef} className="relative z-10 flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
        {messages.map((m, i) =>
          m.type === 'user' ? (
            <UserMessage key={i} text={m.text} />
          ) : (
            <ObiMessage key={i} response={getObiResponse(m.query, mode)} onFollowUp={sendMessage} />
          )
        )}
      </div>

      <div className="relative z-10 flex-none px-6 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask about your team, benchmark against the industry, or generate a report..."
            className="flex-1 rounded-xl px-4 py-3 text-sm outline-none border"
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.1)',
              color: INTEL.text,
            }}
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            className="px-5 py-3 rounded-xl text-sm font-semibold"
            style={{ background: '#FFFFFF', color: INTEL.bg }}
          >
            Send
          </button>
        </div>
        <p className="text-[10px] text-center mt-2 max-w-4xl mx-auto" style={{ color: INTEL.muted }}>
          Obi merges live data with McKinsey · Microsoft · WEF · Harvard · Nielsen Norman
        </p>
      </div>
    </div>
  );
}
