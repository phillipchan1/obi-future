import {
  ALARM_BANNER,
  CHAT_QUICK_PROMPTS,
  INSIGHT_CARDS,
  LEADER_CONTEXT,
  LIVE_FEED,
} from '../../../data/obi-intelligence';
import { INTEL, SEVERITY, SOURCE_COLORS } from './tokens';
import {
  IntelTag,
  LiveIndicator,
  SeverityPill,
  SourceLine,
  ChatCta,
  WhitePillButton,
  IntelInput,
} from './shared/intelUi';
import { useState } from 'react';
import type { InsightCardData } from '../../../data/obi-intelligence';

function InsightZoneCard({
  card,
  onExplore,
}: {
  card: InsightCardData;
  onExplore: (prefill: string) => void;
}) {
  const sev = SEVERITY[card.severity] ?? SEVERITY.benchmark;
  return (
    <div
      className={`flex flex-col p-6 border-l-4 min-h-[320px] ${card.widthClass} w-full`}
      style={{
        backgroundColor: card.bgColor,
        borderLeftColor: sev.border,
        borderTop: `1px solid ${INTEL.border}`,
        borderRight: `1px solid ${INTEL.border}`,
        borderBottom: `1px solid ${INTEL.border}`,
      }}
    >
      <div className="flex flex-wrap gap-1.5 mb-4">
        <SeverityPill label={card.tagPrimary} color={sev.pill} />
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: INTEL.muted }}
        >
          {card.tagSecondary}
        </span>
      </div>
      <h3 className={`font-bold text-white leading-snug mb-4 ${card.headlineSize}`}>
        {card.headline}
      </h3>
      <div className="flex-1 space-y-3">
        {card.sentences.map((s, i) => (
          <p key={i} className="text-[15px] leading-relaxed" style={{ color: INTEL.textBody }}>
            {s}
          </p>
        ))}
      </div>
      <SourceLine text={card.source} />
      <div className="mt-4">
        <ChatCta onClick={() => onExplore(card.chatPrefill)}>Explore in Chat →</ChatCta>
      </div>
    </div>
  );
}

export function IntelligenceView({
  onExploreChat,
  onSendAndOpenChat,
}: {
  onExploreChat: (prefill: string) => void;
  onSendAndOpenChat: (prefill: string) => void;
}) {
  const [quickInput, setQuickInput] = useState('');

  return (
    <div className="space-y-10 pb-12">
      {/* Top section label */}
      <div>
        <div className="flex flex-wrap items-center gap-1 mb-2">
          <IntelTag text="Obi's read on your organization" />
          <LiveIndicator />
        </div>
        <p className="text-sm leading-relaxed max-w-3xl" style={{ color: INTEL.muted }}>
          Obi merges live assessment data with published research from McKinsey, Microsoft,
          Harvard, WEF, and Nielsen Norman Group.
        </p>
        <p
          className="text-2xl sm:text-3xl font-bold text-white mt-6 leading-tight"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
        >
          Here&apos;s what matters for your team, {LEADER_CONTEXT.leaderName}.
        </p>
      </div>

      {/* ZONE 1 — Alarm */}
      <div
        className="flex flex-col lg:flex-row lg:items-center gap-6 p-8 border-l-[6px]"
        style={{
          backgroundColor: INTEL.surfaceAlarm,
          borderLeftColor: INTEL.red,
        }}
      >
        <div className="flex-1">
          <SeverityPill label="⚠ HIGHEST PRIORITY" color={INTEL.red} />
          <p
            className="font-bold text-white mt-4 leading-tight"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3.25rem)' }}
          >
            {ALARM_BANNER.hero}
          </p>
          <p className="text-base mt-4 max-w-2xl" style={{ color: INTEL.muted }}>
            {ALARM_BANNER.sub}
          </p>
          <p className="text-[11px] mt-6" style={{ color: INTEL.muted }}>
            {ALARM_BANNER.timestamp}
          </p>
        </div>
        <div className="flex-shrink-0">
          <WhitePillButton pulse onClick={() => onExploreChat(ALARM_BANNER.ctaPrefill)}>
            Ask Obi what to do →
          </WhitePillButton>
        </div>
      </div>

      {/* ZONE 2 — Three insight cards */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        {INSIGHT_CARDS.map(card => (
          <InsightZoneCard key={card.id} card={card} onExplore={onExploreChat} />
        ))}
      </div>

      {/* ZONE 3 — Live feed */}
      <div>
        <IntelTag text="Signals from the field — updated weekly" />
        <ul className="space-y-0 border rounded-xl overflow-hidden" style={{ borderColor: INTEL.border }}>
          {LIVE_FEED.map((item, i) => {
            const srcColor = SOURCE_COLORS[item.source] ?? INTEL.accent;
            return (
              <li
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-5 py-4 border-b last:border-b-0"
                style={{
                  backgroundColor: INTEL.surface,
                  borderColor: INTEL.border,
                }}
              >
                <span
                  className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide flex-shrink-0 border"
                  style={{ borderColor: srcColor, color: srcColor }}
                >
                  {item.source}
                </span>
                <p className="flex-1 text-[15px] font-semibold text-white leading-snug">
                  {item.insight}
                </p>
                <button
                  type="button"
                  onClick={() => onExploreChat(item.prefill)}
                  className="text-xs font-medium flex-shrink-0 text-left whitespace-nowrap"
                  style={{ color: INTEL.accentBlue }}
                >
                  How this applies to your team →
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ZONE 4 — Chat invitation */}
      <div
        className="border-t pt-10 px-6 py-8 rounded-2xl"
        style={{ backgroundColor: INTEL.surfaceChat, borderColor: INTEL.border }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h2
              className="font-bold text-white leading-tight mb-3"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
            >
              What do you want to know?
            </h2>
            <p className="text-[15px] leading-relaxed mb-6" style={{ color: INTEL.muted }}>
              Obi reads your live data and cross-references published research. Ask about risk,
              benchmarks, trajectories, or generate a report.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CHAT_QUICK_PROMPTS.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSendAndOpenChat(cat.prefill)}
                  className="text-left p-4 rounded-xl border transition-colors hover:brightness-110"
                  style={{
                    backgroundColor: INTEL.surface,
                    borderColor: INTEL.border,
                  }}
                >
                  <span className="text-lg mr-2">{cat.icon}</span>
                  <span className="text-sm font-bold text-white">{cat.label}</span>
                  <p className="text-xs mt-2 line-clamp-2" style={{ color: INTEL.muted }}>
                    &ldquo;{cat.preview}&rdquo;
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <IntelInput
              value={quickInput}
              onChange={setQuickInput}
              onSubmit={() => quickInput.trim() && onSendAndOpenChat(quickInput.trim())}
              placeholder="Or ask anything about your team..."
            />
            <p className="text-[10px] mt-3 text-center" style={{ color: INTEL.muted }}>
              Obi merges live data with McKinsey · Microsoft · WEF · Harvard · Nielsen Norman
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
