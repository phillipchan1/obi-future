import { INTEL } from '../tokens';

export const GLASS = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(255, 255, 255, 0.1)',
  blur: 'blur(12px)',
  radius: '16px',
} as const;

export const ZONES = {
  zone1: '#1A0A3E',
  zone2: '#130820',
  zone3: '#0D0616',
} as const;

export function GlassCard({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl border ${className}`}
      style={{
        backdropFilter: GLASS.blur,
        WebkitBackdropFilter: GLASS.blur,
        background: GLASS.background,
        borderColor: GLASS.border,
        borderRadius: GLASS.radius,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function ZoneWatermark({ word }: { word: string }) {
  return (
    <div
      className="absolute pointer-events-none select-none overflow-hidden"
      aria-hidden
      style={{
        zIndex: 0,
        bottom: '-0.12em',
        right: '-0.1em',
        fontSize: '280px',
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        color: '#FFFFFF',
        opacity: 0.06,
      }}
    >
      {word}
    </div>
  );
}

export function SectionLabel({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <p
      className="text-xs font-bold uppercase tracking-widest mb-4"
      style={{ color }}
    >
      {children}
    </p>
  );
}

export function NarrativeHeadline({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-extrabold text-white leading-[1.1] mb-6 max-w-3xl"
      style={{ fontSize: 'clamp(32px, 4vw, 40px)', fontWeight: 800 }}
    >
      {children}
    </h2>
  );
}

export function NarrativeBody({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="leading-relaxed max-w-[680px] mb-6"
      style={{ fontSize: '16px', color: INTEL.textBody }}
    >
      {children}
    </p>
  );
}

export function SourceCitation({ text }: { text: string }) {
  return (
    <p className="text-xs italic mb-8" style={{ color: INTEL.muted }}>
      {text}
    </p>
  );
}

export function ObiLink({
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
      className="text-sm font-medium transition-opacity hover:opacity-80 text-left"
      style={{ color: INTEL.accentBlue }}
    >
      {children}
    </button>
  );
}
