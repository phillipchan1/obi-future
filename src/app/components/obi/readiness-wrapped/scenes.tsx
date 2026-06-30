import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  ORG,
  SCENE1_INSIGHTS,
  SCENE2_INSIGHTS,
  SCENE3_INSIGHTS,
  ACTION_CARDS,
  COPILOT_USAGE_MODEL,
  buildActionCopilotPrompt,
  coveragePct,
  aiMaximizationPct,
  estimatedMonthlyAgentHoursSaved,
  estimatedQuarterlyChatHoursSaved,
  estimatedQuarterlyHoursSaved,
  LEVEL_CHART_DATA,
  COPILOT_HANDOFF_PROMPT,
  skilledUsageMultiplier,
  topFiveRolesPeople,
  type InsightCard,
} from '../../../../data/readiness-wrapped';
import { CopilotPromptModal } from './CopilotPromptModal';
import {
  ActionCardUI,
  AnimatedBar,
  InsightCardUI,
  SectionEyebrow,
  StatTile,
} from './components';
import { useCountUp } from './hooks';
import { RW, SCENE_ACCENT_STYLES } from './theme';

type SceneProps = Readonly<{
  active: boolean;
  onAskInsight: (card: InsightCard) => void;
}>;

type PromptPreview = {
  title: string;
  subtitle: string;
  prompt: string;
};

function getUsageBarColor(level: string): string {
  if (level === 'Skilled') return RW.greenText;
  if (level === 'Beginner') return RW.orangeText;
  return RW.sidebar;
}

export function SceneCover({ active }: Readonly<{ active: boolean }>) {
  const people = useCountUp(ORG.peopleInScope, active);
  const depts = useCountUp(ORG.departmentsCount, active);
  const assessed = useCountUp(ORG.assessed, active);
  const accent = SCENE_ACCENT_STYLES.neutral;

  return (
    <div
      className="flex flex-col items-center justify-center text-center min-h-[50vh] px-4"
      style={{ animation: active ? 'rw-rise 0.6s ease both' : undefined }}
    >
      <SectionEyebrow accentColor={accent.text}>AI readiness dashboard</SectionEyebrow>
      <h1
        className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 max-w-2xl"
        style={{ color: RW.text }}
      >
        Your AI readiness dashboard.
      </h1>
      <p className="text-base sm:text-lg mb-8 max-w-xl" style={{ color: RW.textSecondary }}>
        A narrative read on where your people stand, how adoption is progressing, where the work is heading, and what to do next.
      </p>

      <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-6">
        <div>
          <p className="text-3xl sm:text-4xl font-bold tabular-nums" style={{ color: RW.text }}>
            {people.toLocaleString()}
          </p>
          <p className="text-xs uppercase tracking-wide mt-1" style={{ color: RW.muted }}>
            people
          </p>
        </div>
        <div className="w-px hidden sm:block" style={{ backgroundColor: RW.border }} />
        <div>
          <p className="text-3xl sm:text-4xl font-bold tabular-nums" style={{ color: RW.text }}>
            {depts}
          </p>
          <p className="text-xs uppercase tracking-wide mt-1" style={{ color: RW.muted }}>
            departments
          </p>
        </div>
        <div className="w-px hidden sm:block" style={{ backgroundColor: RW.border }} />
        <div>
          <p className="text-3xl sm:text-4xl font-bold tabular-nums" style={{ color: RW.text }}>
            {assessed.toLocaleString()}
          </p>
          <p className="text-xs uppercase tracking-wide mt-1" style={{ color: RW.muted }}>
            assessed
          </p>
        </div>
      </div>

      <p className="text-sm font-medium mb-4" style={{ color: RW.textSecondary }}>
        {ORG.name}
      </p>
      <p className="text-xs animate-pulse" style={{ color: RW.muted }}>
        Click anywhere or press Next to begin →
      </p>
    </div>
  );
}

export function SceneWhere({ active, onAskInsight }: SceneProps) {
  const accent = SCENE_ACCENT_STYLES.cool;

  return (
    <div className="space-y-6">
      <header style={{ animation: active ? 'rw-rise 0.5s ease both' : undefined }}>
        <SectionEyebrow accentColor={accent.text}>01 · Where are my people</SectionEyebrow>
        <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: RW.text }}>
          Bought in — but stuck spreading it.
        </h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div
          className="rounded-xl border p-5"
          style={{
            backgroundColor: RW.card,
            borderColor: RW.border,
            boxShadow: RW.cardShadow,
            animation: active ? 'rw-rise 0.5s ease 80ms both' : undefined,
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-3" style={{ color: RW.muted }}>
            Readiness levels
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-40 h-40 shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[...LEVEL_CHART_DATA]}
                    dataKey="value"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {LEVEL_CHART_DATA.map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold tabular-nums" style={{ color: RW.text }}>
                  {ORG.assessed}
                </span>
                <span className="text-[10px] uppercase" style={{ color: RW.muted }}>
                  assessed
                </span>
              </div>
            </div>
            <div className="flex-1 w-full space-y-2">
              {LEVEL_CHART_DATA.map(row => (
                <div key={row.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                    <span style={{ color: RW.textSecondary }}>{row.name}</span>
                  </div>
                  <span className="font-semibold tabular-nums" style={{ color: RW.text }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <StatTile label="Readiness avg" value={ORG.readinessAvg} />
            <StatTile label="Coverage" value={coveragePct} suffix="%" />
          </div>
        </div>

        <div
          className="rounded-xl border p-5"
          style={{
            backgroundColor: RW.card,
            borderColor: RW.border,
            boxShadow: RW.cardShadow,
            animation: active ? 'rw-rise 0.5s ease 160ms both' : undefined,
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-4" style={{ color: RW.muted }}>
            Dimension averages (1–5)
          </p>
          <div className="space-y-3">
            {ORG.dimensions.map((d, i) => (
              <div key={d.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span
                    className={d.weakest ? 'font-semibold' : ''}
                    style={{ color: d.weakest ? RW.orangeText : RW.textSecondary }}
                  >
                    {d.name}
                    {d.weakest && ' · weakest'}
                  </span>
                  <span className="font-semibold tabular-nums" style={{ color: RW.text }}>
                    {d.v}
                  </span>
                </div>
                <AnimatedBar
                  value={d.v}
                  max={5}
                  color={d.weakest ? RW.orangeText : RW.sidebar}
                  highlight={!!d.weakest}
                  active={active}
                  delay={200 + i * 80}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SCENE1_INSIGHTS.map((card, i) => (
          <InsightCardUI
            key={card.id}
            {...card}
            animateIn={active}
            staggerDelay={240 + i * 80}
            onAsk={() => onAskInsight(card)}
          />
        ))}
      </div>
    </div>
  );
}

export function SceneDoing({ active, onAskInsight }: SceneProps) {
  const accent = SCENE_ACCENT_STYLES.warm;
  const total = ORG.copilot.active + ORG.copilot.dormant + ORG.copilot.unlicensed;
  const dormantPct = Math.round((ORG.copilot.dormant / ORG.copilot.licensed) * 100);
  const maxChats = Math.max(...COPILOT_USAGE_MODEL.readinessUsage.map(row => row.chatsPerQtr));

  return (
    <div className="space-y-6">
      <header style={{ animation: active ? 'rw-rise 0.5s ease both' : undefined }}>
        <SectionEyebrow accentColor={accent.text}>02 · How are they progressing</SectionEyebrow>
        <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: RW.text }}>
          Your readiness is only partly turning into usage.
        </h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-5">
        <div
          className="rounded-xl border p-6 sm:p-8"
          style={{
            backgroundColor: RW.card,
            borderColor: RW.border,
            boxShadow: RW.cardShadow,
            animation: active ? 'rw-rise 0.5s ease 80ms both' : undefined,
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: RW.muted }}>
                AI maximization
              </p>
              <p className="text-4xl font-bold tabular-nums" style={{ color: RW.orangeText }}>
                {aiMaximizationPct}%
              </p>
              <p className="text-xs mt-1" style={{ color: RW.textSecondary }}>
                readiness × active-license rate
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: RW.muted }}>
                Estimated time saved
              </p>
              <p className="text-4xl font-bold tabular-nums" style={{ color: RW.text }}>
                {estimatedQuarterlyHoursSaved}
              </p>
              <p className="text-xs mt-1" style={{ color: RW.textSecondary }}>
                hours / quarter
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: RW.muted }}>
                Agents built
              </p>
              <p className="text-4xl font-bold tabular-nums" style={{ color: RW.text }}>
                {ORG.copilot.agents}
              </p>
              <p className="text-xs mt-1" style={{ color: RW.textSecondary }}>
                by {ORG.copilot.builders} builders
              </p>
            </div>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: RW.muted }}>
            License utilization
          </p>
          <div className="flex h-8 rounded-lg overflow-hidden mb-3">
            {[
              { label: 'Active', value: ORG.copilot.active, color: RW.greenText },
              { label: 'Idle', value: ORG.copilot.dormant, color: RW.orangeText },
              { label: 'Unlicensed', value: ORG.copilot.unlicensed, color: RW.border },
            ].map((seg, i) => (
              <div
                key={seg.label}
                className="h-full transition-all duration-700 ease-out"
                style={{
                  width: active ? `${(seg.value / total) * 100}%` : '0%',
                  backgroundColor: seg.color,
                  transitionDelay: `${i * 100}ms`,
                }}
                title={`${seg.label}: ${seg.value}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-xs" style={{ color: RW.textSecondary }}>
            <span>
              <strong style={{ color: RW.greenText }}>{ORG.copilot.active}</strong> active
            </span>
            <span>
              <strong style={{ color: RW.orangeText }}>{ORG.copilot.dormant}</strong> idle ({dormantPct}% of licenses)
            </span>
            <span>
              <strong>{ORG.copilot.unlicensed}</strong> unlicensed
            </span>
          </div>
          <p className="text-xs mt-4 italic" style={{ color: RW.muted }}>
            Time saved estimate: {estimatedQuarterlyChatHoursSaved} hours from chats plus{' '}
            {estimatedMonthlyAgentHoursSaved} hours/month from agents, using conservative prototype assumptions.
          </p>
        </div>

        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: RW.card,
            borderColor: RW.border,
            boxShadow: RW.cardShadow,
            animation: active ? 'rw-rise 0.5s ease 160ms both' : undefined,
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: RW.muted }}>
            Usage intensity by readiness
          </p>
          <p className="text-sm mb-5" style={{ color: RW.textSecondary }}>
            Skilled users chat {skilledUsageMultiplier}x more than Beginners. That makes usage a leading indicator
            for whether readiness is becoming real operating leverage.
          </p>
          <div className="space-y-3">
            {COPILOT_USAGE_MODEL.readinessUsage.map((row, i) => (
              <div key={row.level}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium" style={{ color: RW.textSecondary }}>
                    {row.level}
                    <span style={{ color: RW.muted }}> · {row.people} people</span>
                  </span>
                  <span className="font-semibold tabular-nums" style={{ color: RW.text }}>
                    {row.chatsPerQtr} chats/qtr
                  </span>
                </div>
                <AnimatedBar
                  value={row.chatsPerQtr}
                  max={maxChats}
                  color={getUsageBarColor(row.level)}
                  active={active}
                  delay={220 + i * 80}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {SCENE2_INSIGHTS.map((card, i) => (
          <InsightCardUI
            key={card.id}
            {...card}
            animateIn={active}
            staggerDelay={160 + i * 80}
            onAsk={() => onAskInsight(card)}
          />
        ))}
      </div>
    </div>
  );
}

export function SceneRoles({ active, onAskInsight }: SceneProps) {
  const accent = SCENE_ACCENT_STYLES.amber;
  const maxRole = Math.max(...ORG.roles.top.map(r => r.n));
  const [promptPreview, setPromptPreview] = useState<PromptPreview | null>(null);

  return (
    <div className="space-y-6">
      <CopilotPromptModal
        open={promptPreview !== null}
        title={promptPreview?.title ?? ''}
        subtitle={promptPreview?.subtitle ?? ''}
        prompt={promptPreview?.prompt ?? ''}
        onClose={() => setPromptPreview(null)}
      />
      <header style={{ animation: active ? 'rw-rise 0.5s ease both' : undefined }}>
        <SectionEyebrow accentColor={accent.text}>03 · Where&apos;s the work going</SectionEyebrow>
        <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: RW.text }}>
          23 roles — but the work runs through a handful.
        </h2>
      </header>

      <div
        className="rounded-xl border p-5 sm:p-6"
        style={{
          backgroundColor: RW.card,
          borderColor: RW.border,
          boxShadow: RW.cardShadow,
          animation: active ? 'rw-rise 0.5s ease 80ms both' : undefined,
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide mb-4" style={{ color: RW.muted }}>
          Top roles by headcount
        </p>
        <div className="space-y-2.5">
          {ORG.roles.top.map((role, i) => (
            <div key={role.name} className="flex items-center gap-3">
              <span
                className="text-xs w-36 sm:w-44 shrink-0 truncate"
                style={{ color: RW.textSecondary }}
                title={role.name}
              >
                {role.name}
              </span>
              <div className="flex-1 h-5 rounded-md overflow-hidden" style={{ backgroundColor: RW.borderLight }}>
                <div
                  className="h-full rounded-md transition-all duration-700 ease-out"
                  style={{
                    width: active ? `${(role.n / maxRole) * 100}%` : '0%',
                    backgroundColor: RW.sidebar,
                    transitionDelay: `${i * 60}ms`,
                  }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums w-8 text-right" style={{ color: RW.text }}>
                {role.n}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs mt-4 italic" style={{ color: RW.muted }}>
          + {ORG.roles.tailRoles} more roles · {ORG.roles.tailPeople} people in the long tail · top 5 roles cover{' '}
          {topFiveRolesPeople} people
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SCENE3_INSIGHTS.map((card, i) => (
          <InsightCardUI
            key={card.id}
            {...card}
            animateIn={active}
            staggerDelay={160 + i * 80}
            onAsk={() => onAskInsight(card)}
            onCopilotPrompt={
              card.variant === 'copilot-handoff'
                ? () =>
                    setPromptPreview({
                      title: 'Explore role change in Copilot',
                      subtitle: 'A forward-looking prompt seeded with the role mix from this scene.',
                      prompt: COPILOT_HANDOFF_PROMPT,
                    })
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

type ScenePlanProps = Readonly<{
  active: boolean;
  onAskAction: (card: (typeof ACTION_CARDS)[number]) => void;
}>;

export function ScenePlan({ active, onAskAction }: ScenePlanProps) {
  const accent = SCENE_ACCENT_STYLES.success;
  const [promptPreview, setPromptPreview] = useState<PromptPreview | null>(null);

  return (
    <div className="space-y-6">
      <CopilotPromptModal
        open={promptPreview !== null}
        title={promptPreview?.title ?? ''}
        subtitle={promptPreview?.subtitle ?? ''}
        prompt={promptPreview?.prompt ?? ''}
        onClose={() => setPromptPreview(null)}
      />
      <header style={{ animation: active ? 'rw-rise 0.5s ease both' : undefined }}>
        <SectionEyebrow accentColor={accent.text}>04 · Your 2026 game plan</SectionEyebrow>
        <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: RW.text }}>
          Six moves — each one earned by the story you just walked through.
        </h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACTION_CARDS.map((card, i) => (
          <ActionCardUI
            key={card.id}
            {...card}
            animateIn={active}
            staggerDelay={80 + i * 60}
            onAsk={() => onAskAction(card)}
            onCopilotPrompt={() =>
              setPromptPreview({
                title: `Brainstorm: ${card.title}`,
                subtitle: 'A recommendation prompt seeded with the evidence behind this action.',
                prompt: buildActionCopilotPrompt(card),
              })
            }
          />
        ))}
      </div>

      <p
        className="text-sm text-center pt-2 italic"
        style={{ color: RW.muted, animation: active ? 'rw-rise 0.5s ease 500ms both' : undefined }}
      >
        This story sharpens every time someone finishes — momentum tracking unlocks once reassessments accrue.
      </p>
    </div>
  );
}
