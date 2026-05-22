import { Bot } from 'lucide-react';
import { INTEL } from '../tokens';

export function IntelTag({ text }: { text: string }) {
  return (
    <p
      className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3"
      style={{ color: INTEL.muted }}
    >
      {text}
    </p>
  );
}

/** Poster-scale hero — 52px min, extrabold, tight leading */
export function HeroText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h1
      className={`tracking-tight ${className}`}
      style={{
        fontSize: 'clamp(52px, 5vw, 64px)',
        fontWeight: 800,
        lineHeight: 1.1,
        color: '#FFFFFF',
      }}
    >
      {children}
    </h1>
  );
}

export function PosterLine({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 'clamp(52px, 4.5vw, 56px)',
        fontWeight: 800,
        lineHeight: 1.1,
        color: '#FFFFFF',
      }}
    >
      {children}
    </p>
  );
}

export function HeroSubtext({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base sm:text-lg leading-relaxed mt-3 max-w-2xl" style={{ color: INTEL.muted }}>
      {children}
    </p>
  );
}

export function LiveIndicator() {
  return (
    <span className="inline-flex items-center gap-2 ml-3 align-middle">
      <span
        className="w-2 h-2 rounded-full intel-pulse-dot"
        style={{ backgroundColor: INTEL.green }}
      />
      <span
        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
        style={{ backgroundColor: `${INTEL.green}33`, color: INTEL.green }}
      >
        Live
      </span>
    </span>
  );
}

export function SeverityPill({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <span
      className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: `${color}33`, color }}
    >
      {label}
    </span>
  );
}

export function SourceLine({ text }: { text: string }) {
  return (
    <p className="text-[11px] italic mt-3" style={{ color: INTEL.muted }}>
      {text}
    </p>
  );
}

export function ChatCta({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-medium underline underline-offset-2 transition-opacity hover:opacity-80 text-left"
      style={{ color: INTEL.accentBlue }}
    >
      {children}
    </button>
  );
}

export function WhitePillButton({
  children,
  onClick,
  pulse,
}: {
  children: React.ReactNode;
  onClick: () => void;
  pulse?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap transition-all hover:opacity-95 ${
        pulse ? 'intel-btn-glow' : ''
      }`}
      style={{
        backgroundColor: '#FFFFFF',
        color: INTEL.bg,
        borderRadius: '9999px',
        padding: '12px 24px',
        fontWeight: 600,
        fontSize: '14px',
      }}
    >
      {children}
    </button>
  );
}

export function OutlinedButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 rounded-xl text-xs font-semibold border transition-colors hover:bg-white/5"
      style={{ borderColor: INTEL.border, color: INTEL.text }}
    >
      {children}
    </button>
  );
}

export function AiNote({ text }: { text: string }) {
  return (
    <div className="flex gap-1.5 items-start">
      <Bot size={12} className="flex-shrink-0 mt-0.5" style={{ color: INTEL.muted }} />
      <p className="text-xs italic leading-relaxed" style={{ color: INTEL.muted }}>
        {text}
      </p>
    </div>
  );
}

export function IntelInput({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder: string;
}) {
  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSubmit()}
        placeholder={placeholder}
        className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
        style={{
          backgroundColor: INTEL.surface,
          border: `1px solid ${INTEL.border}`,
          color: INTEL.text,
        }}
      />
      <button
        type="button"
        onClick={onSubmit}
        className="px-5 py-3 rounded-xl text-sm font-bold"
        style={{ backgroundColor: INTEL.text, color: INTEL.bg }}
      >
        Send
      </button>
    </div>
  );
}
