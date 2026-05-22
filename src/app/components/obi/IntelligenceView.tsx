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
  PosterLine,
} from './shared/intelUi';
import { useState } from 'react';
import type { InsightCardData } from '../../../data/obi-intelligence';

const CARD_WIDTH_CLASS = [
  'w-full lg:w-[42%] lg:flex-[0_0_42%]',
  'w-full lg:w-[30%] lg:flex-[0_0_30%]',
  'w-full lg:w-[28%] lg:flex-[0_0_28%]',
] as const;

function InsightZoneCard({
  card,
  widthClass,
  onExplore,
}: {
  card: InsightCardData;
  widthClass: string;
  onExplore: (prefill: string) => void;
}) {
  const sev = SEVERITY[card.severity] ?? SEVERITY.benchmark;
  return (
    <div
      className={`flex flex-col min-h-[320px] border-l-4 ${widthClass}`}
      style={{
        padding: '28px',
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
      <h3
        className="text-white leading-[1.15] mb-4"
        style={{
          fontSize: card.headlineSize === 'text-2xl' ? '24px' : '20px',
          fontWeight: 700,
        }}
      >
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
      {/* Intro + poster hero */}
      <div>
        <div className="flex flex-wrap items-center gap-1 mb-3">
          <IntelTag text="Obi's read on your organization" />
          <LiveIndicator />
        </div>
        <p className="text-sm leading-relaxed max-w-3xl mb-8" style={{ color: INTEL.muted }}>
          Obi merges live assessment data with published research from McKinsey, Microsoft,
          Harvard, WEF, and Nielsen Norman Group.
        </p>
        <PosterLine>
          Here&apos;s what matters for your team, {LEADER_CONTEXT.leaderName}.
        </PosterLine>
      </div>

      {/* ZONE 1 — Alarm banner (not a card) */}
      <div
        className="w-full flex flex-col lg:flex-row lg:items-center gap-8"
        style={{
          backgroundColor: INTEL.surfaceAlarm,
          borderLeft: `6px solid ${INTEL.red}`,
          padding: '32px',
        }}
      >
        <div className="flex-1 min-w-0">
          <SeverityPill label="⚠ HIGHEST PRIORITY" color={INTEL.red} />
          <div className="mt-4">
            <PosterLine>{ALARM_BANNER.hero}</PosterLine>
          </div>
          <p className="text-base mt-4 max-w-2xl leading-relaxed" style={{ color: INTEL.muted }}>
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

      {/* ZONE 2 — Three insight cards (unequal widths) */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch w-full">
        {INSIGHT_CARDS.map((card, i) => (
          <InsightZoneCard
            key={card.id}
            card={card}
            widthClass={CARD_WIDTH_CLASS[i] ?? CARD_WIDTH_CLASS[1]}
            onExplore={onExploreChat}
          />
        ))}
      </div>

      {/* ZONE 3 — Live intelligence feed */}
      <div>
        <IntelTag text="Signals from the field — updated weekly" />
        <ul
          className="rounded-xl overflow-hidden border"
          style={{ borderColor: INTEL.border, backgroundColor: INTEL.surface }}
        >
          {LIVE_FEED.map(item => {
            const srcColor = SOURCE_COLORS[item.source] ?? INTEL.accent;
            return (
              <li
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-5 py-4 border-b last:border-b-0"
                style={{ borderColor: INTEL.border }}
              >
                <span
                  className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide flex-shrink-0 border"
                  style={{ borderColor: srcColor, color: srcColor }}
                >
                  {item.source}
                </span>
                <p
                  className="flex-1 font-semibold leading-snug"
                  style={{ fontSize: '15px', color: INTEL.text }}
                >
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
        className="border-t pt-10 px-7 py-8 rounded-2xl border"
        style={{
          backgroundColor: INTEL.surfaceChat,
          borderColor: INTEL.border,
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h2
              className="text-white leading-[1.1] mb-3"
              style={{ fontSize: '36px', fontWeight: 800 }}
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
                  className="text-left rounded-xl border transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: INTEL.surface,
                    borderColor: INTEL.border,
                    padding: '16px',
                  }}
                >
                  <span className="text-lg mr-2">{cat.icon}</span>
                  <span className="text-sm font-bold" style={{ color: INTEL.text }}>
                    {cat.label}
                  </span>
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
