import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Send,
  Sparkles,
  ListChecks,
  ArrowRight,
  MessageSquare,
  Mail,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { PLAYBOOK, OBI_READ_LINE, type PlaybookItem } from '../../../data/playbook';
import { INTEL } from './tokens';
import { ZONES } from './shared/glass';

type Status = 'pending' | 'approved' | 'skipped';

const TONE_COLORS: Record<PlaybookItem['chipTone'], { bg: string; fg: string; glow: string }> = {
  lead: { bg: 'rgba(248, 81, 73, 0.15)', fg: '#FF8A82', glow: 'rgba(248, 81, 73, 0.35)' },
  momentum: { bg: 'rgba(63, 185, 80, 0.15)', fg: '#7EE095', glow: 'rgba(63, 185, 80, 0.3)' },
  recovery: { bg: 'rgba(210, 153, 34, 0.15)', fg: '#F5C964', glow: 'rgba(210, 153, 34, 0.3)' },
  narrative: { bg: 'rgba(46, 117, 182, 0.18)', fg: '#7EB8FF', glow: 'rgba(46, 117, 182, 0.35)' },
};

const ACTION_ICON = {
  slack: MessageSquare,
  email: Mail,
  memo: FileText,
} as const;

const ACTION_VERB = {
  slack: 'Send Slack',
  email: 'Send email',
  memo: 'Save & share',
} as const;

function useTypewriter(text: string, enabled: boolean, speed = 22) {
  const [out, setOut] = useState(enabled ? '' : text);
  useEffect(() => {
    if (!enabled) {
      setOut(text);
      return;
    }
    setOut('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, enabled, speed]);
  return out;
}

export function FocusMode({
  onAskObi,
  onExit,
}: {
  onAskObi: (prefill: string) => void;
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [sliderIdx, setSliderIdx] = useState<Record<string, number>>(() =>
    Object.fromEntries(PLAYBOOK.map(p => [p.id, p.slider.defaultIndex]))
  );
  const [digIn, setDigIn] = useState(false);
  const [showPlaybook, setShowPlaybook] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const item = PLAYBOOK[index];
  const isFirst = !hasSeenIntro && index === 0;
  const typed = useTypewriter(OBI_READ_LINE, isFirst);
  const currentSlider = sliderIdx[item.id] ?? item.slider.defaultIndex;
  const currentStatus = status[item.id] ?? 'pending';

  useEffect(() => {
    if (isFirst && typed === OBI_READ_LINE) {
      const t = setTimeout(() => setHasSeenIntro(true), 400);
      return () => clearTimeout(t);
    }
  }, [typed, isFirst]);

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= PLAYBOOK.length) return;
      setTransitioning(true);
      setDigIn(false);
      setTimeout(() => {
        setIndex(next);
        setTransitioning(false);
      }, 180);
    },
    []
  );

  const advance = useCallback(
    (newStatus: Status) => {
      setStatus(s => ({ ...s, [item.id]: newStatus }));
      if (index < PLAYBOOK.length - 1) {
        goTo(index + 1);
      }
    },
    [item.id, index, goTo]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showPlaybook) {
        if (e.key === 'Escape') setShowPlaybook(false);
        return;
      }
      if (e.key === 'ArrowRight') goTo(index + 1);
      if (e.key === 'ArrowLeft') goTo(index - 1);
      if (e.key === 'a' && !e.metaKey && !e.ctrlKey) advance('approved');
      if (e.key === 's' && !e.metaKey && !e.ctrlKey) advance('skipped');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, advance, index, showPlaybook]);

  const counts = useMemo(() => {
    const approved = PLAYBOOK.filter(p => status[p.id] === 'approved').length;
    const skipped = PLAYBOOK.filter(p => status[p.id] === 'skipped').length;
    return { approved, skipped, remaining: PLAYBOOK.length - approved - skipped };
  }, [status]);

  const allDone = counts.remaining === 0;
  const tone = TONE_COLORS[item.chipTone];
  const ActionIcon = ACTION_ICON[item.drafted.type];

  return (
    <div
      className="relative min-h-screen"
      style={{
        background: `radial-gradient(120% 80% at 50% 0%, ${ZONES.zone1} 0%, ${ZONES.zone2} 60%, ${ZONES.zone3} 100%)`,
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
          50%      { box-shadow: 0 0 0 6px rgba(255,255,255,0.05); }
        }
        .fade-up { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .fade-in { animation: fadeIn 0.5s ease both; }
        .blink::after {
          content: '▍';
          margin-left: 2px;
          opacity: 0.6;
          animation: blinkCursor 0.9s steps(2) infinite;
        }
        @keyframes blinkCursor { 50% { opacity: 0; } }
      `}</style>

      {/* Top bar — progress + escape hatches */}
      <div className="sticky top-0 z-30 px-6 lg:px-10 pt-6 pb-4"
        style={{
          background: 'linear-gradient(180deg, rgba(13,6,22,0.85) 0%, rgba(13,6,22,0) 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowPlaybook(true)}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors hover:bg-white/5"
            style={{ borderColor: 'rgba(255,255,255,0.12)', color: INTEL.muted }}
          >
            <ListChecks size={14} />
            Playbook
          </button>

          {/* Progress dots */}
          <div className="flex-1 flex items-center justify-center gap-2">
            {PLAYBOOK.map((p, i) => {
              const s = status[p.id];
              const isCurrent = i === index;
              const w = isCurrent ? 40 : 8;
              const bg =
                s === 'approved'
                  ? INTEL.green
                  : s === 'skipped'
                  ? 'rgba(255,255,255,0.18)'
                  : isCurrent
                  ? '#FFFFFF'
                  : 'rgba(255,255,255,0.25)';
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => goTo(i)}
                  className="h-[6px] rounded-full transition-all"
                  style={{ width: w, background: bg }}
                  aria-label={`Move ${i + 1}`}
                />
              );
            })}
          </div>

          <span className="text-xs font-semibold tabular-nums" style={{ color: INTEL.muted }}>
            {index + 1} <span style={{ opacity: 0.5 }}>/ {PLAYBOOK.length}</span>
          </span>

          <button
            type="button"
            onClick={onExit}
            className="text-xs font-medium opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: INTEL.muted }}
            title="Exit Focus Mode"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Obi's read line — only on first item, then fades out */}
      {!hasSeenIntro && (
        <div className="px-6 lg:px-10 max-w-4xl mx-auto mb-2 fade-in">
          <div className="flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: INTEL.accent }}
            >
              <Sparkles size={14} className="text-white" />
            </div>
            <p
              className={`italic text-base leading-relaxed ${typed.length < OBI_READ_LINE.length ? 'blink' : ''}`}
              style={{ color: INTEL.textBody }}
            >
              {typed}
            </p>
          </div>
        </div>
      )}

      {/* Main canvas */}
      <div className="px-6 lg:px-10 pt-6 pb-32 max-w-4xl mx-auto">
        {allDone ? (
          <DoneScreen counts={counts} onReset={() => setStatus({})} onExit={onExit} />
        ) : (
          <div
            key={item.id}
            className="fade-up"
            style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 180ms ease' }}
          >
            {/* Chip */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                style={{
                  background: tone.bg,
                  color: tone.fg,
                  boxShadow: `0 0 24px ${tone.glow}`,
                }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: tone.fg }}
                />
                {item.chipLabel}
              </span>
              <span className="text-xs" style={{ color: INTEL.muted }}>
                Obi inferred this · high confidence
              </span>
            </div>

            {/* Situation */}
            <h1
              className="font-extrabold text-white leading-[1.08] mb-5"
              style={{ fontSize: 'clamp(28px, 4.2vw, 44px)' }}
            >
              {item.situation}
            </h1>

            {/* Obi's call */}
            <div className="flex items-start gap-3 mb-8">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-1"
                style={{ background: 'rgba(107, 70, 193, 0.35)' }}
              >
                <Sparkles size={12} className="text-white" />
              </div>
              <p
                className="leading-relaxed"
                style={{ fontSize: 'clamp(16px, 1.6vw, 19px)', color: INTEL.textBody }}
              >
                <span className="font-semibold text-white">Obi's call · </span>
                {item.obiCall}
              </p>
            </div>

            {/* Drafted action */}
            <div
              className="rounded-2xl border mb-6 overflow-hidden"
              style={{
                borderColor: 'rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-3 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2.5">
                  <ActionIcon size={14} style={{ color: INTEL.muted }} />
                  <span className="text-xs font-semibold" style={{ color: INTEL.muted }}>
                    Drafted · to {item.drafted.to}
                  </span>
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded"
                  style={{ background: 'rgba(255,255,255,0.06)', color: INTEL.muted }}
                >
                  editable
                </span>
              </div>
              <div className="px-5 py-4">
                {item.drafted.subject && (
                  <p className="text-sm font-semibold text-white mb-2">{item.drafted.subject}</p>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: INTEL.textBody }}>
                  {item.drafted.body}
                </p>
              </div>
            </div>

            {/* Slider */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: INTEL.muted }}
                >
                  {item.slider.label}
                </span>
                <span className="text-xs" style={{ color: INTEL.muted }}>
                  Drag to see projected impact
                </span>
              </div>
              <div
                className="flex items-stretch rounded-xl border overflow-hidden"
                style={{
                  borderColor: 'rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                {item.slider.options.map((opt, i) => {
                  const active = i === currentSlider;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSliderIdx(s => ({ ...s, [item.id]: i }))}
                      className="flex-1 px-4 py-3 text-sm font-semibold transition-all text-center"
                      style={{
                        background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                        color: active ? '#FFFFFF' : INTEL.muted,
                        borderRight:
                          i < item.slider.options.length - 1
                            ? '1px solid rgba(255,255,255,0.06)'
                            : 'none',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <div
                className="flex items-center gap-2 mt-3 px-1 fade-in"
                key={`proj-${item.id}-${currentSlider}`}
              >
                <ArrowRight size={14} style={{ color: tone.fg }} />
                <p className="text-sm" style={{ color: INTEL.textBody }}>
                  <span className="font-semibold text-white">Projection · </span>
                  {item.slider.options[currentSlider].projection}
                </p>
              </div>
            </div>

            {/* Dig in expand */}
            <button
              type="button"
              onClick={() => setDigIn(d => !d)}
              className="flex items-center gap-1.5 text-xs font-semibold mb-2 transition-opacity hover:opacity-80"
              style={{ color: INTEL.accentBlue }}
            >
              <ChevronDown
                size={14}
                style={{
                  transform: digIn ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 200ms ease',
                }}
              />
              {digIn ? 'Hide reasoning' : 'Show Obi’s reasoning & sources'}
            </button>
            {digIn && (
              <div
                className="rounded-xl border p-5 mb-8 fade-up"
                style={{
                  borderColor: 'rgba(255,255,255,0.08)',
                  background: 'rgba(0,0,0,0.18)',
                }}
              >
                <p
                  className="text-[11px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: INTEL.muted }}
                >
                  Why Obi recommends this
                </p>
                <ul className="space-y-2 mb-4">
                  {item.evidence.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: INTEL.textBody }}>
                      <span
                        className="inline-block w-1 h-1 rounded-full mt-2 flex-shrink-0"
                        style={{ background: tone.fg }}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {item.evidence.sources.map(s => (
                    <span
                      key={s.label}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: INTEL.textBody,
                      }}
                    >
                      <span style={{ color: tone.fg }}>{s.label}</span>
                      <span style={{ color: INTEL.muted }}>· {s.meta}</span>
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => onAskObi(`Tell me more about why you recommend: ${item.obiCall}`)}
                  className="mt-4 text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ color: INTEL.accentBlue }}
                >
                  Continue this with Obi →
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => advance('approved')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-transform hover:scale-[1.02]"
                style={{
                  background: INTEL.green,
                  color: '#0D2818',
                  boxShadow: '0 8px 24px rgba(63, 185, 80, 0.25)',
                }}
              >
                <Send size={15} />
                Approve & {ACTION_VERB[item.drafted.type].toLowerCase()}
                <kbd className="ml-1 text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(0,0,0,0.18)' }}>
                  A
                </kbd>
              </button>
              <button
                type="button"
                onClick={() => advance('skipped')}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-white/5"
                style={{ color: INTEL.muted }}
              >
                Skip for now
                <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  S
                </kbd>
              </button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => onAskObi(`I want to dig deeper on: ${item.situation}`)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-white/5"
                style={{ color: INTEL.accentBlue }}
              >
                Open in chat →
              </button>
            </div>

            {/* Prev/next bottom */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                disabled={index === 0}
                className="flex items-center gap-1 text-xs font-semibold transition-opacity disabled:opacity-30 hover:opacity-80"
                style={{ color: INTEL.muted }}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span className="text-[11px]" style={{ color: INTEL.muted }}>
                Use ← → to navigate · A to approve · S to skip
              </span>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                disabled={index === PLAYBOOK.length - 1}
                className="flex items-center gap-1 text-xs font-semibold transition-opacity disabled:opacity-30 hover:opacity-80"
                style={{ color: INTEL.muted }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Playbook overlay */}
      {showPlaybook && (
        <PlaybookOverlay
          status={status}
          currentIndex={index}
          onJump={i => {
            goTo(i);
            setShowPlaybook(false);
          }}
          onClose={() => setShowPlaybook(false)}
        />
      )}
    </div>
  );
}

function PlaybookOverlay({
  status,
  currentIndex,
  onJump,
  onClose,
}: {
  status: Record<string, Status>;
  currentIndex: number;
  onJump: (i: number) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-6 fade-in"
      style={{ background: 'rgba(8, 4, 18, 0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border overflow-hidden"
        style={{
          background: ZONES.zone2,
          borderColor: 'rgba(255,255,255,0.1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: INTEL.muted }}>
              This week's playbook
            </p>
            <p className="text-base font-semibold text-white mt-0.5">
              {PLAYBOOK.length} moves Obi recommends
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: INTEL.muted }}
          >
            <X size={16} />
          </button>
        </div>
        <ol className="p-2">
          {PLAYBOOK.map((p, i) => {
            const s = status[p.id] ?? 'pending';
            const tone = TONE_COLORS[p.chipTone];
            const isCurrent = i === currentIndex;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onJump(i)}
                  className="w-full text-left px-4 py-3 rounded-xl flex items-start gap-3 transition-colors hover:bg-white/5"
                  style={{ background: isCurrent ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background:
                        s === 'approved'
                          ? INTEL.green
                          : s === 'skipped'
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(255,255,255,0.08)',
                      color: s === 'approved' ? '#0D2818' : INTEL.muted,
                    }}
                  >
                    {s === 'approved' ? <Check size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: tone.fg }}
                      >
                        {p.chipLabel}
                      </span>
                      {s === 'skipped' && (
                        <span className="text-[10px]" style={{ color: INTEL.muted }}>
                          · skipped
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-white leading-snug">{p.situation}</p>
                  </div>
                  <ChevronRight size={16} style={{ color: INTEL.muted }} className="mt-2 flex-shrink-0" />
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function DoneScreen({
  counts,
  onReset,
  onExit,
}: {
  counts: { approved: number; skipped: number; remaining: number };
  onReset: () => void;
  onExit: () => void;
}) {
  return (
    <div className="text-center pt-12 fade-up">
      <div
        className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
        style={{
          background: 'rgba(63, 185, 80, 0.15)',
          boxShadow: '0 0 60px rgba(63, 185, 80, 0.25)',
        }}
      >
        <Check size={36} style={{ color: INTEL.green }} />
      </div>
      <h2 className="text-3xl font-extrabold text-white mb-3">You're through this week's playbook.</h2>
      <p className="text-base mb-8" style={{ color: INTEL.textBody }}>
        <span className="font-semibold text-white">{counts.approved}</span> moves in motion ·{' '}
        <span style={{ color: INTEL.muted }}>{counts.skipped} skipped</span>
      </p>
      <p className="text-sm mb-10 max-w-md mx-auto" style={{ color: INTEL.muted }}>
        Obi will check progress in a few days and surface new moves as the data shifts. Come back tomorrow — there will be a fresh read.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: INTEL.accent, color: '#FFFFFF' }}
        >
          Back to briefing
        </button>
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
          style={{ color: INTEL.muted }}
        >
          Replay playbook
        </button>
      </div>
    </div>
  );
}
