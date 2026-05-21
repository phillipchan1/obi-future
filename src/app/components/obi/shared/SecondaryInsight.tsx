import { GlassPanel } from './gamePlanUi';

export function SecondaryInsight({ text }: { text: string }) {
  return (
    <GlassPanel>
      <p className="text-xs leading-snug text-white/70">{text}</p>
    </GlassPanel>
  );
}
