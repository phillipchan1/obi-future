import type { InsightCardData } from '../../../../data/obi-intelligence';
import { SEVERITY, INTEL } from '../tokens';
import { GlassCard, SeverityPill, TextLink } from './gamePlanUi';

export function InsightCard({
  card,
  onExplore,
}: {
  card: InsightCardData;
  onExplore: (prefill: string) => void;
}) {
  const sev = SEVERITY[card.severity] ?? SEVERITY.benchmark;

  return (
    <GlassCard borderAccent={sev.border} className="h-full">
      <div className="flex justify-end gap-1 mb-3 flex-wrap">
        <SeverityPill label={card.tagPrimary} color={sev.pill} />
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: INTEL.muted }}
        >
          {card.tagSecondary}
        </span>
      </div>
      <h3 className="text-sm font-bold leading-snug mb-2 text-white">{card.headline}</h3>
      <div className="flex-1 space-y-2 mb-3">
        {card.sentences.map((s, i) => (
          <p key={i} className="text-xs leading-relaxed" style={{ color: INTEL.textBody }}>
            {s}
          </p>
        ))}
      </div>
      <p className="text-[11px] italic mb-3" style={{ color: INTEL.muted }}>
        {card.source}
      </p>
      <TextLink onClick={() => onExplore(card.chatPrefill)}>Explore in Chat →</TextLink>
    </GlassCard>
  );
}
