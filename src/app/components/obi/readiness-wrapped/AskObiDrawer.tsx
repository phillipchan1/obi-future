import { useCallback, useEffect, useState } from 'react';
import { X, Sparkles, Send } from 'lucide-react';
import {
  FOLLOW_UP_QUESTIONS,
  GENERAL_ASK_OBI_QUESTIONS,
  type ActionCard,
  type InsightCard,
} from '../../../../data/readiness-wrapped';
import { getObiStubAnswer } from './obiAnswers';
import { RW } from './theme';
import { useFocusOnOpen } from './components';

export type AskObiContext =
  | { mode: 'general' }
  | { mode: 'card'; card: InsightCard | ActionCard; cardType: 'insight' | 'action' };

type Message = { role: 'user' | 'obi'; text: string };

type AskObiDrawerProps = {
  open: boolean;
  onClose: () => void;
  context: AskObiContext;
};

function getCardTitle(ctx: AskObiContext): string | undefined {
  if (ctx.mode === 'card') return ctx.card.title;
  return undefined;
}

function getCardBody(ctx: AskObiContext): string | undefined {
  if (ctx.mode === 'card') {
    if ('body' in ctx.card) return ctx.card.body;
    return ctx.card.description;
  }
  return undefined;
}

function getSuggestedQuestions(ctx: AskObiContext): string[] {
  if (ctx.mode === 'general') return GENERAL_ASK_OBI_QUESTIONS;
  const id = ctx.card.id;
  return FOLLOW_UP_QUESTIONS[id] ?? GENERAL_ASK_OBI_QUESTIONS;
}

export function AskObiDrawer({ open, onClose, context }: AskObiDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const inputRef = useFocusOnOpen(open);

  useEffect(() => {
    if (!open) {
      setMessages([]);
      setInput('');
      setThinking(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const submitQuestion = useCallback(
    (question: string) => {
      if (!question.trim() || thinking) return;
      const q = question.trim();
      setInput('');
      setMessages(prev => [...prev, { role: 'user', text: q }]);
      setThinking(true);
      const title = getCardTitle(context);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'obi', text: getObiStubAnswer(q, title) }]);
        setThinking(false);
      }, 700);
    },
    [context, thinking],
  );

  if (!open) return null;

  const suggested = getSuggestedQuestions(context);
  const cardTitle = getCardTitle(context);
  const cardBody = getCardBody(context);

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[2px]"
        aria-hidden
        onClick={e => {
          e.stopPropagation();
          onClose();
        }}
      />
      <aside
        role="dialog"
        aria-label="Ask Obi"
        aria-modal="true"
        className="fixed z-[110] flex flex-col bg-white shadow-2xl
          inset-x-0 bottom-0 max-h-[88vh] rounded-t-2xl border-t
          sm:inset-y-0 sm:right-0 sm:left-auto sm:bottom-auto sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:border-l sm:border-t-0"
        style={{ backgroundColor: RW.pageBg, borderColor: RW.border }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="sm:hidden mx-auto mt-3 h-1 w-10 rounded-full shrink-0"
          style={{ backgroundColor: RW.border }}
        />

        <header
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: RW.border }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: RW.purpleText }} />
            <h2 className="text-sm font-semibold" style={{ color: RW.text }}>
              Ask Obi
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <X size={18} style={{ color: RW.muted }} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
          {context.mode === 'card' && cardTitle && (
            <div
              className="rounded-xl border px-4 py-3 text-sm"
              style={{ backgroundColor: RW.purpleBg, borderColor: RW.purpleBorder, color: RW.textSecondary }}
            >
              <p className="font-semibold mb-1" style={{ color: RW.purpleText }}>
                {cardTitle}
              </p>
              <p className="leading-relaxed">{cardBody}</p>
            </div>
          )}

          {messages.length === 0 && !thinking && (
            <p className="text-sm" style={{ color: RW.muted }}>
              {context.mode === 'general'
                ? 'Ask anything about your org readiness data.'
                : 'Pick a follow-up or type your own question.'}
            </p>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`text-sm leading-relaxed rounded-xl px-4 py-3 max-w-[95%] ${
                m.role === 'user' ? 'ml-auto' : ''
              }`}
              style={
                m.role === 'user'
                  ? { backgroundColor: RW.sidebar, color: '#fff' }
                  : { backgroundColor: RW.card, color: RW.textSecondary, border: `1px solid ${RW.border}` }
              }
            >
              {m.text}
            </div>
          ))}

          {thinking && (
            <div
              className="text-sm rounded-xl px-4 py-3 animate-pulse"
              style={{ backgroundColor: RW.card, color: RW.muted, border: `1px solid ${RW.border}` }}
            >
              Obi is thinking…
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {suggested.map(q => (
              <button
                key={q}
                type="button"
                onClick={() => submitQuestion(q)}
                disabled={thinking}
                className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: RW.card,
                  borderColor: RW.border,
                  color: RW.textSecondary,
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <footer
          className="shrink-0 border-t px-5 py-4 space-y-2"
          style={{ borderColor: RW.border, backgroundColor: RW.card }}
        >
          <form
            onSubmit={e => {
              e.preventDefault();
              submitQuestion(input);
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a follow-up…"
              disabled={thinking}
              className="flex-1 text-sm px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-offset-1"
              style={{
                borderColor: RW.border,
                backgroundColor: RW.pageBg,
                color: RW.text,
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="p-2.5 rounded-xl transition-opacity disabled:opacity-40"
              style={{ backgroundColor: RW.sidebar, color: '#fff' }}
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
          <p className="text-[10px] text-center" style={{ color: RW.muted }}>
            In production, reads your live data via the SQL connection.
          </p>
        </footer>
      </aside>
    </>
  );
}

export function useAskObi() {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<AskObiContext>({ mode: 'general' });

  const openGeneral = useCallback(() => {
    setContext({ mode: 'general' });
    setOpen(true);
  }, []);

  const openFromInsight = useCallback((card: InsightCard) => {
    setContext({ mode: 'card', card, cardType: 'insight' });
    setOpen(true);
  }, []);

  const openFromAction = useCallback((card: ActionCard) => {
    setContext({ mode: 'card', card, cardType: 'action' });
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return { open, context, openGeneral, openFromInsight, openFromAction, close };
}
