import { GlassCard } from './gamePlanUi';

/** @deprecated use GlassCard — kept for imports migrating */
export function Surface({
  children,
  className = '',
  borderAccent,
}: {
  children: React.ReactNode;
  className?: string;
  borderAccent?: string;
}) {
  return (
    <GlassCard className={className} borderAccent={borderAccent}>
      {children}
    </GlassCard>
  );
}
