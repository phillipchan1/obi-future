import { useState, useRef } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { LEADER_STATS, formatEmployeeId } from '../../../data/dashboard';
import {
  getAtRiskEmployees,
  getPeerCoaches,
  daysSinceActive,
  TREND_DATA,
} from '../../../data/briefing';
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
import { TeamDataTable } from './TeamDataTable';
import { DATA_CHAT_PREFILL } from '../../../data/obi-intelligence';

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function CompanyBriefing({ onAskObi }: { onAskObi: (prefill: string) => void }) {
  const [dataExpanded, setDataExpanded] = useState(false);
  const zone2Ref = useRef<HTMLDivElement>(null);
  const atRisk = getAtRiskEmployees();
  const coaches = getPeerCoaches();
  const gap = LEADER_STATS.topQuartileBenchmark - LEADER_STATS.avgScore;

  return (
    <div className="pb-32">
      {/* ZONE 1 — Headline */}
      <section
        className="relative min-h-screen flex flex-col justify-center px-6 lg:px-10 py-16 overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${ZONES.zone1} 0%, ${ZONES.zone1} 85%, ${ZONES.zone2} 100%)`,
        }}
      >
        <ZoneWatermark word="INTEL" />
        <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <IntelTag text="Obi's read on your organization" />
              <LiveIndicator />
            </div>
            <p
              className="font-extrabold leading-none text-white"
              style={{ fontSize: '120px', fontWeight: 800, lineHeight: 1 }}
            >
              {LEADER_STATS.avgScore}
            </p>
            <p className="text-sm mt-2 mb-8" style={{ color: INTEL.muted }}>
              team average readiness
            </p>

            <GlassCard className="p-6 mb-8 max-w-lg">
              <div className="space-y-3 mb-3">
                <div className="flex items-center gap-3 text-xs" style={{ color: INTEL.muted }}>
                  <span className="w-24 shrink-0">Your team</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(LEADER_STATS.avgScore / LEADER_STATS.topQuartileBenchmark) * 100}%`,
                        backgroundColor: INTEL.accentBlue,
                      }}
                    />
                  </div>
                  <span className="font-bold text-white w-10 text-right">{LEADER_STATS.avgScore}</span>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: INTEL.muted }}>
                  <span className="w-24 shrink-0">Sector benchmark</span>
                  <div className="flex-1 h-2 rounded-full border border-dashed" style={{ borderColor: 'rgba(255,255,255,0.35)' }}>
                    <div className="h-full w-full rounded-full opacity-40" style={{ background: 'rgba(255,255,255,0.2)' }} />
                  </div>
                  <span className="font-bold text-white w-10 text-right">{LEADER_STATS.topQuartileBenchmark}+</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-white mb-1">
                {gap} points behind top-quartile utility orgs
              </p>
              <p className="text-xs" style={{ color: INTEL.muted }}>
                At current pace: ~11 weeks to close the gap
              </p>
              <p className="text-xs italic mt-3" style={{ color: INTEL.muted }}>
                Microsoft Work Trend Index, 2025
              </p>
            </GlassCard>

            <p
              className="font-extrabold text-white leading-[1.1]"
              style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800 }}
            >
              Your trajectory is stronger than average.
              <br />
              The window is open — but it won&apos;t stay open.
            </p>
          </div>

          <GlassCard className="p-6">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color: INTEL.muted }}>
              3 things that need your attention
            </p>
            <ol className="space-y-0">
              {[
                {
                  emoji: '🔴',
                  label: 'Intervene now',
                  line: '6 employees · high AI exposure · zero progress',
                  sub: 'Discovery & Research · Beginner level · Day 1 to now',
                  link: 'See who →',
                  target: 'section-risk',
                  prefill: 'What should I do about my 6 highest-risk employees?',
                },
                {
                  emoji: '🟡',
                  label: 'Re-engage',
                  line: `${LEADER_STATS.nonReengagedCount} employees haven't returned since Day 1`,
                  sub: `${LEADER_STATS.reengagementRatePct}% re-engagement rate — above average but improvable`,
                  link: 'See who →',
                  target: 'section-data',
                  prefill: "Why haven't 35 employees re-engaged?",
                },
                {
                  emoji: '🟢',
                  label: 'Activate',
                  line: '3 peer coaches identified — none activated yet',
                  sub: 'HBR: peer coaching = 40% faster skill transfer',
                  link: 'See who →',
                  target: 'section-opportunity',
                  prefill: 'How should I activate my 3 peer coaches?',
                },
              ].map((item, i) => (
                <li
                  key={item.label}
                  className={`py-4 ${i < 2 ? 'border-b' : ''}`}
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <p className="text-sm font-bold text-white mb-1">
                    {item.emoji} {item.label}
                  </p>
                  <p className="text-sm text-white/90">{item.line}</p>
                  <p className="text-xs mt-1 mb-2" style={{ color: INTEL.muted }}>
                    {item.sub}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      scrollToId(item.target);
                      if (item.prefill) onAskObi(item.prefill);
                    }}
                    className="text-xs font-medium"
                    style={{ color: INTEL.accentBlue }}
                  >
                    {item.link}
                  </button>
                </li>
              ))}
            </ol>
          </GlassCard>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10 animate-bounce">
          <span className="flex items-center gap-2 text-xs" style={{ color: INTEL.muted }}>
            <ChevronDown size={16} /> Read the full briefing
          </span>
        </div>
      </section>

      {/* ZONE 2 — Narrative */}
      <div
        ref={zone2Ref}
        style={{
          background: `linear-gradient(180deg, ${ZONES.zone2} 0%, ${ZONES.zone3} 100%)`,
        }}
      >
        <section id="section-risk" className="relative px-6 lg:px-10 py-20 overflow-hidden">
          <ZoneWatermark word="DATA" />
          <div className="relative z-10 max-w-6xl mx-auto">
            <SectionLabel color={INTEL.red}>01 — Risk</SectionLabel>
            <NarrativeHeadline>Your most exposed employees are your least ready.</NarrativeHeadline>
            <NarrativeBody>
              6 employees in Discovery & Research roles are rated 92% AI-disrupted — and still at
              Beginner level. McKinsey&apos;s 2025 utility sector analysis identifies this cluster as
              facing fundamental transformation within 18 months. This is not a training gap. It is a
              strategic risk.
            </NarrativeBody>
            <SourceCitation text="McKinsey Global Institute, 2025" />

            <GlassCard className="p-4 mb-6 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    {['Employee', 'Title', 'Score', 'Days Since Active', 'Gap'].map(h => (
                      <th key={h} className="text-left py-2 px-2 font-semibold uppercase tracking-wide" style={{ color: INTEL.muted }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {atRisk.map(e => (
                    <tr
                      key={e.id}
                      className="border-b last:border-0"
                      style={{
                        borderColor: 'rgba(255,255,255,0.06)',
                        backgroundColor: e.gapScore > 30 ? 'rgba(248,81,73,0.12)' : 'transparent',
                      }}
                    >
                      <td className="py-2.5 px-2 text-white font-medium">{formatEmployeeId(e.id)}</td>
                      <td className="py-2.5 px-2" style={{ color: INTEL.muted }}>{e.title}</td>
                      <td className="py-2.5 px-2 text-white">{e.finalScore}</td>
                      <td className="py-2.5 px-2" style={{ color: INTEL.muted }}>{daysSinceActive(e.day)}</td>
                      <td className="py-2.5 px-2 font-medium" style={{ color: e.gapScore > 30 ? INTEL.red : INTEL.text }}>
                        {e.gapScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[10px] mt-3" style={{ color: INTEL.muted }}>
                Showing 6 of {LEADER_STATS.uniqueCompletions} — filtered: high exposure + Beginner
              </p>
            </GlassCard>
            <ObiLink onClick={() => onAskObi('What should I do about my 6 highest-risk employees?')}>
              Ask Obi how to intervene with these employees →
            </ObiLink>
          </div>
        </section>

        <section id="section-benchmark" className="relative px-6 lg:px-10 py-20 overflow-hidden border-t border-transparent">
          <div className="relative z-10 max-w-6xl mx-auto">
            <SectionLabel color={INTEL.yellow}>02 — Benchmark</SectionLabel>
            <NarrativeHeadline>Above average trajectory. Below benchmark destination.</NarrativeHeadline>
            <NarrativeBody>
              Your team averages {LEADER_STATS.avgScore} — above the utility sector median but {gap}{' '}
              points behind top-quartile organizations. The gap isn&apos;t the problem. The trajectory is
              the story: your average score grew {LEADER_STATS.scoreGainInRollout} points in the first{' '}
              {LEADER_STATS.rolloutDay} days, stronger than typical cohort ramp rates. Microsoft&apos;s
              Work Trend Index shows top-quartile utility orgs maintain 70+ Copilot chats per quarter.
              Your team median: {LEADER_STATS.medianCopilotUsage}. That gap compounds — top users see 2x
              the productivity benefit within 6 months.
            </NarrativeBody>
            <SourceCitation text="Microsoft Work Trend Index, 2025" />

            <GlassCard className="p-4 mb-6 max-w-[480px]">
              <div className="h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={TREND_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="day"
                      tick={{ fill: INTEL.muted, fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={d => (d === 1 ? 'Day 1' : d === 5 ? 'Day 5' : '')}
                    />
                    <YAxis hide domain={[55, 82]} />
                    <ReferenceLine y={79} stroke="rgba(255,255,255,0.35)" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="avgScore" stroke={INTEL.accentBlue} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="benchmark" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} strokeDasharray="6 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-2 text-[10px]" style={{ color: INTEL.muted }}>
                <span><span className="inline-block w-3 h-0.5 align-middle mr-1" style={{ background: INTEL.accentBlue }} /> Your avg</span>
                <span><span className="inline-block w-3 h-0.5 align-middle mr-1 border-t border-dashed border-white/50" /> Benchmark</span>
              </div>
            </GlassCard>
            <ObiLink onClick={() => onAskObi('At current pace when do we reach the utility sector benchmark?')}>
              Ask Obi to project our trajectory →
            </ObiLink>
          </div>
        </section>

        <section id="section-opportunity" className="relative px-6 lg:px-10 py-20 overflow-hidden">
          <div className="relative z-10 max-w-6xl mx-auto">
            <SectionLabel color={INTEL.green}>03 — Opportunity</SectionLabel>
            <NarrativeHeadline>Your fastest win costs nothing.</NarrativeHeadline>
            <NarrativeBody>
              3 employees on your team have reached Skilled level in roles that map directly to your
              lowest-readiness groups. Harvard Business Review (2024) found peer-led AI skill transfer
              outperforms instructor-led training by 40% in enterprise settings. These people are already
              here. They just haven&apos;t been activated.
            </NarrativeBody>
            <SourceCitation text="Harvard Business Review, 2024" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {coaches.map(c => (
                <GlassCard key={c.id} className="p-4">
                  <p className="font-bold text-white text-sm mb-1">{formatEmployeeId(c.id)}</p>
                  <p className="text-xs mb-2" style={{ color: INTEL.muted }}>{c.title}</p>
                  <p className="text-lg font-bold text-white mb-2">{c.finalScore}</p>
                  <LevelPill level={c.level} />
                  <p className="text-[10px] mt-3" style={{ color: INTEL.muted }}>
                    Maps to: {c.mapsTo}
                  </p>
                </GlassCard>
              ))}
            </div>
            <ObiLink onClick={() => onAskObi('How should I activate my 3 peer coaches?')}>
              Ask Obi how to activate peer coaches →
            </ObiLink>
          </div>
        </section>

        <section id="section-data" className="relative px-6 lg:px-10 py-20 pb-32 overflow-hidden">
          <div className="relative z-10 max-w-6xl mx-auto">
            <button
              type="button"
              onClick={() => setDataExpanded(!dataExpanded)}
              className="w-full flex items-center justify-between py-4 mb-4"
            >
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: INTEL.muted }}>
                  Full team records
                </p>
                {!dataExpanded && (
                  <p className="text-sm mt-1" style={{ color: INTEL.muted }}>
                    {LEADER_STATS.uniqueCompletions} employee records · click to expand · names anonymized
                  </p>
                )}
              </div>
              {dataExpanded ? <ChevronDown size={20} style={{ color: INTEL.muted }} /> : <ChevronRight size={20} style={{ color: INTEL.muted }} />}
            </button>
            {dataExpanded && (
              <div className="space-y-6">
                <TeamDataTable compactHeader />
                <div className="text-center">
                  <p className="text-sm italic mb-2" style={{ color: INTEL.muted }}>
                    Want Obi to analyze this?
                  </p>
                  <ObiLink onClick={() => onAskObi(DATA_CHAT_PREFILL)}>Ask in Chat →</ObiLink>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
