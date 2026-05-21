import { Bot } from 'lucide-react';

/** Shared visual language with Game Plan (FullPage) */
export const GP = {
  pageBg: 'from-slate-950 via-blue-950 to-indigo-950',
  card: 'bg-white/8 backdrop-blur-2xl border border-white/12',
  cardSm: 'bg-white/8 border border-white/12',
  cardInset: 'bg-white/5 border border-white/10',
  roundedLg: 'rounded-3xl',
  roundedMd: 'rounded-2xl',
  roundedSm: 'rounded-xl',
} as const;

export function Tag({ text }: { text: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">{text}</p>
  );
}

export function SectionTitle({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: React.ReactNode;
}) {
  return (
    <h2 className="text-white font-bold text-lg leading-snug mb-2">
      {children}
      {accent && <> {accent}</>}
    </h2>
  );
}

export function AiNote({ text }: { text: string }) {
  return (
    <div className="flex gap-1.5 items-start">
      <Bot size={12} className="text-white/30 flex-shrink-0 mt-0.5" />
      <p className="text-white/40 text-xs italic leading-relaxed">{text}</p>
    </div>
  );
}

export function GlassCard({
  children,
  className = '',
  borderAccent,
}: {
  children: React.ReactNode;
  className?: string;
  borderAccent?: string;
}) {
  return (
    <div
      className={`${GP.card} ${GP.roundedMd} p-5 sm:p-6 flex flex-col ${className}`}
      style={borderAccent ? { borderLeftWidth: 3, borderLeftColor: borderAccent } : undefined}
    >
      {children}
    </div>
  );
}

export function GlassPanel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${GP.cardSm} ${GP.roundedSm} p-4 ${className}`}>{children}</div>
  );
}

export function PillButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all duration-200 ${
        active
          ? 'bg-white/20 border-white/30 text-white'
          : 'bg-transparent border-white/12 text-white/45 hover:text-white/65 hover:border-white/20'
      }`}
    >
      {label}
    </button>
  );
}

export function TextLink({
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
      className="text-xs font-medium text-cyan-300/90 hover:text-cyan-200 transition-colors text-left"
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
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
      className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white text-slate-900 hover:bg-white/90 transition-all"
    >
      {children}
    </button>
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
