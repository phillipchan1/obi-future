import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import type { Confidence } from '../../../../data/readiness-wrapped';
import { CONFIDENCE_STYLES, RW } from './theme';

export function ConfidenceBadge({ level }: Readonly<{ level: Confidence }>) {
  const style = CONFIDENCE_STYLES[level];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {level}
    </span>
  );
}

type InsightCardProps = Readonly<{
  title: string;
  body: string;
  confidence: Confidence;
  footnote?: string;
  variant?: 'default' | 'copilot-handoff';
  onAsk: () => void;
  onCopilotPrompt?: () => void;
  className?: string;
  staggerDelay?: number;
  animateIn?: boolean;
}>;

export function InsightCardUI({
  title,
  body,
  confidence,
  footnote,
  variant = 'default',
  onAsk,
  onCopilotPrompt,
  className = '',
  staggerDelay = 0,
  animateIn = true,
}: InsightCardProps) {
  const isCopilot = variant === 'copilot-handoff';

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onAsk();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={e => {
        e.stopPropagation();
        onAsk();
      }}
      onKeyDown={handleKeyDown}
      className={`group relative w-full text-left rounded-xl border p-5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer ${className}`}
      style={{
        backgroundColor: isCopilot ? RW.pageBg : RW.card,
        borderColor: isCopilot ? RW.muted : RW.border,
        borderStyle: isCopilot ? 'dashed' : 'solid',
        boxShadow: isCopilot ? 'none' : RW.cardShadow,
        animation: animateIn ? `rw-rise 0.5s ease ${staggerDelay}ms both` : undefined,
      }}
    >
      <span
        className="absolute top-3 right-3 text-[10px] font-medium opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
        style={{ color: RW.purpleText }}
      >
        ✦ ask Obi
      </span>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        {isCopilot ? (
          <span
            className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md"
            style={{ backgroundColor: RW.purpleBg, color: RW.purpleText }}
          >
            Explore with Copilot
          </span>
        ) : (
          <ConfidenceBadge level={confidence} />
        )}
      </div>

      <h3 className="text-sm font-semibold mb-1.5 pr-16" style={{ color: RW.text }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: RW.textSecondary }}>
        {body}
      </p>
      {footnote && (
        <p className="text-xs mt-2 italic" style={{ color: RW.muted }}>
          {footnote}
        </p>
      )}

      {isCopilot && onCopilotPrompt && (
        <span
          role="button"
          tabIndex={0}
          onClick={e => {
            e.stopPropagation();
            onCopilotPrompt();
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onCopilotPrompt();
            }
          }}
          className="mt-4 inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors hover:opacity-90"
          style={{
            color: RW.purpleText,
            borderColor: RW.purpleBorder,
            backgroundColor: RW.purpleBg,
          }}
        >
          Preview Copilot prompt →
        </span>
      )}
    </div>
  );
}

type ActionCardProps = Readonly<{
  title: string;
  description: string;
  why: string;
  evidence: string[];
  timing: string;
  impact: string;
  effort: string;
  provenance: string;
  onAsk: () => void;
  staggerDelay?: number;
  animateIn?: boolean;
}>;

export function ActionCardUI({
  title,
  description,
  why,
  evidence,
  timing,
  impact,
  effort,
  provenance,
  onAsk,
  staggerDelay = 0,
  animateIn = true,
}: ActionCardProps) {
  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation();
        onAsk();
      }}
      className="group relative w-full text-left rounded-xl border p-5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        backgroundColor: RW.card,
        borderColor: RW.border,
        boxShadow: RW.cardShadow,
        animation: animateIn ? `rw-rise 0.5s ease ${staggerDelay}ms both` : undefined,
      }}
    >
      <span
        className="absolute top-3 right-3 text-[10px] font-medium opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
        style={{ color: RW.purpleText }}
      >
        ✦ ask Obi
      </span>
      <h3 className="text-sm font-semibold mb-1 pr-14" style={{ color: RW.text }}>
        {title}
      </h3>
      <p className="text-sm mb-3" style={{ color: RW.textSecondary }}>
        {description}
      </p>
      <div
        className="rounded-lg border px-3 py-2.5 mb-3"
        style={{ backgroundColor: RW.purpleBg, borderColor: RW.purpleBorder }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: RW.purpleText }}>
          Why this is earned
        </p>
        <p className="text-xs leading-relaxed mb-2" style={{ color: RW.textSecondary }}>
          {why}
        </p>
        <ul className="space-y-1">
          {evidence.map(point => (
            <li key={point} className="flex gap-1.5 text-xs leading-snug" style={{ color: RW.textSecondary }}>
              <span className="mt-[0.35rem] h-1 w-1 rounded-full shrink-0" style={{ backgroundColor: RW.purpleText }} />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <MetaPill label={timing} accent="green" />
        <MetaPill label={impact} accent="neutral" />
        {effort !== '—' && <MetaPill label={effort} accent="neutral" />}
        <MetaPill label={provenance} accent="muted" />
      </div>
    </button>
  );
}

function MetaPill({
  label,
  accent,
}: Readonly<{
  label: string;
  accent: 'green' | 'neutral' | 'muted';
}>) {
  let styles = { bg: '#F3F4F6', color: RW.textSecondary };
  if (accent === 'green') styles = { bg: RW.greenBg, color: RW.greenText };
  if (accent === 'muted') styles = { bg: RW.borderLight, color: RW.muted };
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: styles.bg, color: styles.color }}
    >
      {label}
    </span>
  );
}

export function AnimatedBar({
  value,
  max,
  color,
  highlight,
  active,
  delay = 0,
}: Readonly<{
  value: number;
  max: number;
  color: string;
  highlight?: boolean;
  active: boolean;
  delay?: number;
}>) {
  const pct = Math.min(100, (value / max) * 100);
  const reduced = globalThis.window?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false;

  return (
    <div
      className="h-2 rounded-full overflow-hidden"
      style={{ backgroundColor: RW.borderLight }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: active ? `${pct}%` : '0%',
          backgroundColor: color,
          transition: reduced ? 'none' : `width 0.8s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
          outline: highlight ? `2px solid ${RW.orangeText}` : undefined,
          outlineOffset: highlight ? 1 : undefined,
        }}
      />
    </div>
  );
}

export function SectionEyebrow({ children, accentColor }: Readonly<{ children: ReactNode; accentColor?: string }>) {
  return (
    <p
      className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-2"
      style={{ color: accentColor ?? RW.muted }}
    >
      {children}
    </p>
  );
}

export function StatTile({
  label,
  value,
  suffix = '',
}: Readonly<{ label: string; value: string | number; suffix?: string }>) {
  return (
    <div
      className="rounded-xl border px-4 py-3"
      style={{ backgroundColor: RW.card, borderColor: RW.border, boxShadow: RW.cardShadow }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: RW.muted }}>
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums" style={{ color: RW.text }}>
        {value}
        {suffix && (
          <span className="text-base font-semibold" style={{ color: RW.muted }}>
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}

export function useFocusOnOpen(open: boolean) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [open]);
  return inputRef;
}
