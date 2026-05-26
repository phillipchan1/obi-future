import { ChevronDown } from 'lucide-react';
import { MY_VIEW } from '../../../data/dashboard';
import { MY_VIEW_CARDS } from '../../../data/obi-intelligence';
import { INTEL } from './tokens';
import {
  GlassCard,
  ZoneWatermark,
  SectionLabel,
  NarrativeHeadline,
  NarrativeBody,
  SourceCitation,
  ObiLink,
  ZONES,
} from './shared/glass';
import { LiveIndicator, IntelTag } from './shared/intelUi';
import { LevelPill } from './shared/LevelPill';

const PRIORITIES = [
  {
    emoji: '🔴',
    line: `Your role is ${MY_VIEW.persona.exposureScore}/10 AI-disrupted`,
    sub: MY_VIEW_CARDS[0].body.split('.')[0] + '.',
  },
  {
    emoji: '🟡',
    line: `${MY_VIEW.persona.doNowRemaining} Do Now courses remaining`,
    sub: 'Finishing Do Now in week 1 leads to 3x retention vs delaying.',
  },
  {
    emoji: '🟢',
    line: `You're above your team median on Copilot`,
    sub: `${MY_VIEW.copilot.chatCount} chats vs org median ${MY_VIEW.copilot.orgMedian}.`,
  },
];

export function EmployeeBriefing({ onAskObi }: { onAskObi: (prefill: string) => void }) {
  const { persona, copilot } = MY_VIEW;
  const percentile = copilot.percentile;

  return (
    <div className="pb-32">
      <section
        className="relative min-h-screen flex flex-col justify-center px-6 lg:px-10 py-16 overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${ZONES.zone1} 0%, ${ZONES.zone1} 85%, ${ZONES.zone2} 100%)`,
        }}
      >
        <ZoneWatermark word="INTEL" />
        <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 items-center">
          <div>
            <IntelTag text="Your personal briefing" />
            <LiveIndicator />
            <p
              className="font-extrabold leading-none text-white mt-4"
              style={{ fontSize: '120px', fontWeight: 800, lineHeight: 1 }}
            >
              {persona.finalScore}
            </p>
            <p className="text-sm mt-2 mb-4" style={{ color: INTEL.muted }}>
              your readiness score
            </p>
            <div className="mb-6">
              <LevelPill level={persona.aiLevel} />
            </div>
            <p
              className="font-extrabold text-white leading-[1.1] max-w-lg"
              style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800 }}
            >
              You&apos;re in the {percentile}nd percentile of your team. Here&apos;s what that means.
            </p>
          </div>

          <GlassCard className="p-6">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color: INTEL.muted }}>
              3 things for you this week
            </p>
            <ol>
              {PRIORITIES.map((item, i) => (
                <li
                  key={item.line}
                  className={`py-4 ${i < 2 ? 'border-b' : ''}`}
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <p className="text-sm font-bold text-white mb-1">
                    {item.emoji} {item.line}
                  </p>
                  <p className="text-xs" style={{ color: INTEL.muted }}>
                    {item.sub}
                  </p>
                </li>
              ))}
            </ol>
          </GlassCard>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10 animate-bounce">
          <span className="flex items-center gap-2 text-xs" style={{ color: INTEL.muted }}>
            <ChevronDown size={16} /> Read your full briefing
          </span>
        </div>
      </section>

      <div style={{ background: `linear-gradient(180deg, ${ZONES.zone2} 0%, ${ZONES.zone3} 100%)` }}>
        <section className="relative px-6 lg:px-10 py-20 overflow-hidden">
          <ZoneWatermark word="DATA" />
          <div className="relative z-10 max-w-6xl mx-auto">
            <SectionLabel color={INTEL.yellow}>01 — Your pressure</SectionLabel>
            <NarrativeHeadline>{MY_VIEW_CARDS[0].headline}</NarrativeHeadline>
            <NarrativeBody>{MY_VIEW_CARDS[0].body}</NarrativeBody>
            <SourceCitation text={MY_VIEW_CARDS[0].source} />
            <ObiLink onClick={() => onAskObi('What should I focus on this week?')}>
              Ask Obi what to focus on this week →
            </ObiLink>
          </div>
        </section>

        <section className="relative px-6 lg:px-10 py-20 overflow-hidden">
          <div className="relative z-10 max-w-6xl mx-auto">
            <SectionLabel color={INTEL.accentBlue}>02 — Your benchmark</SectionLabel>
            <NarrativeHeadline>{MY_VIEW_CARDS[1].headline}</NarrativeHeadline>
            <NarrativeBody>{MY_VIEW_CARDS[1].body}</NarrativeBody>
            <SourceCitation text={MY_VIEW_CARDS[1].source} />
            <ObiLink onClick={() => onAskObi('How do I compare to others in my role?')}>
              Ask Obi how you compare →
            </ObiLink>
          </div>
        </section>

        <section className="relative px-6 lg:px-10 py-20 pb-40 overflow-hidden">
          <ZoneWatermark word="ASK" />
          <div className="relative z-10 max-w-6xl mx-auto">
            <SectionLabel color={INTEL.green}>03 — Your opportunity</SectionLabel>
            <NarrativeHeadline>{MY_VIEW_CARDS[2].headline}</NarrativeHeadline>
            <NarrativeBody>{MY_VIEW_CARDS[2].body}</NarrativeBody>
            <SourceCitation text={MY_VIEW_CARDS[2].source} />
            <ObiLink onClick={() => onAskObi("What's my biggest skill gap right now?")}>
              Ask Obi about your biggest gap →
            </ObiLink>
          </div>
        </section>
      </div>
    </div>
  );
}
