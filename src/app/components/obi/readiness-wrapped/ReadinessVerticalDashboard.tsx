import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  ACTION_CARDS,
  COPILOT_USAGE_MODEL,
  LEVEL_CHART_DATA,
  ORG,
  SCENE1_INSIGHTS,
  SCENE2_INSIGHTS,
  aiMaximizationPct,
  coveragePct,
  dormantLicensePct,
  estimatedQuarterlyHoursSaved,
  skilledUsageMultiplier,
  type ActionCard,
  type Confidence,
  type InsightCard,
} from '../../../../data/readiness-wrapped';
import { AskObiDrawer, useAskObi } from './AskObiDrawer';
import { CONFIDENCE_STYLES, RW } from './theme';

const sidebarItems = ['Dashboard', 'Readiness', 'Usage', 'Actions'];

function getToneColor(tone: 'neutral' | 'green' | 'orange' | 'purple') {
  if (tone === 'green') return RW.greenText;
  if (tone === 'orange') return RW.orangeText;
  if (tone === 'purple') return RW.purpleText;
  return RW.text;
}

function getDepartmentColor(score: number) {
  if (score >= 75) return RW.greenText;
  if (score >= 60) return RW.orangeText;
  return RW.redText;
}

function getUsageColor(level: string) {
  if (level === 'Skilled') return RW.greenText;
  if (level === 'Beginner') return RW.orangeText;
  return RW.sidebar;
}

function ConfidenceBadge({ level }: Readonly<{ level: Confidence }>) {
  const style = CONFIDENCE_STYLES[level];
  return (
    <span
      className="inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {level}
    </span>
  );
}

function SectionTitle({ children }: Readonly<{ children: string }>) {
  return (
    <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: RW.muted }}>
      {children}
    </h2>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone = 'neutral',
}: Readonly<{
  label: string;
  value: string;
  detail: string;
  tone?: 'neutral' | 'green' | 'orange' | 'purple';
}>) {
  const toneColor = getToneColor(tone);

  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: RW.card, borderColor: RW.border, boxShadow: RW.cardShadow }}>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: RW.muted }}>
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums" style={{ color: toneColor }}>
        {value}
      </p>
      <p className="mt-1 text-xs leading-relaxed" style={{ color: RW.textSecondary }}>
        {detail}
      </p>
    </div>
  );
}

function InsightPanel({ card, onAsk }: Readonly<{ card: InsightCard; onAsk: () => void }>) {
  return (
    <button
      type="button"
      onClick={onAsk}
      className="group relative w-full rounded-xl border p-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ backgroundColor: RW.purpleBg, borderColor: RW.purpleBorder, boxShadow: RW.cardShadow }}
    >
      <span
        className="absolute right-3 top-3 text-[10px] font-medium opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{ color: RW.purpleText }}
      >
        ✦ ask Obi
      </span>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: RW.purpleText }}>
          AI synthesis
        </p>
        <ConfidenceBadge level={card.confidence} />
      </div>
      <h3 className="mb-2 text-sm font-semibold" style={{ color: RW.text }}>
        {card.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: RW.textSecondary }}>
        {card.body}
      </p>
      {card.footnote && (
        <p className="mt-3 text-xs italic" style={{ color: RW.muted }}>
          {card.footnote}
        </p>
      )}
    </button>
  );
}

function ActionPanel({ card, onAsk }: Readonly<{ card: ActionCard; onAsk: () => void }>) {
  return (
    <button
      type="button"
      onClick={onAsk}
      className="group relative w-full rounded-xl border p-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ backgroundColor: RW.card, borderColor: RW.border, boxShadow: RW.cardShadow }}
    >
      <span
        className="absolute right-3 top-3 text-[10px] font-medium opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{ color: RW.purpleText }}
      >
        ✦ ask Obi
      </span>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <MetaPill label={card.timing} tone="green" />
        <MetaPill label={card.impact} tone="neutral" />
        {card.effort !== '—' && <MetaPill label={card.effort} tone="neutral" />}
        <MetaPill label={card.provenance} tone="muted" />
      </div>
      <h3 className="mb-1 text-sm font-semibold" style={{ color: RW.text }}>
        {card.title}
      </h3>
      <p className="mb-3 text-sm leading-relaxed" style={{ color: RW.textSecondary }}>
        {card.description}
      </p>
      <div className="rounded-lg border p-3" style={{ backgroundColor: RW.purpleBg, borderColor: RW.purpleBorder }}>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: RW.purpleText }}>
          Data behind the move
        </p>
        <p className="mb-2 text-xs leading-relaxed" style={{ color: RW.textSecondary }}>
          {card.why}
        </p>
        <ul className="space-y-1">
          {card.evidence.map(point => (
            <li key={point} className="flex gap-1.5 text-xs leading-snug" style={{ color: RW.textSecondary }}>
              <span className="mt-[0.35rem] h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: RW.purpleText }} />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </button>
  );
}

function MetaPill({ label, tone }: Readonly<{ label: string; tone: 'green' | 'neutral' | 'muted' }>) {
  let styles = { bg: '#F3F4F6', color: RW.textSecondary };
  if (tone === 'green') styles = { bg: RW.greenBg, color: RW.greenText };
  if (tone === 'muted') styles = { bg: RW.borderLight, color: RW.muted };

  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: styles.bg, color: styles.color }}>
      {label}
    </span>
  );
}

function DimensionBar({ name, value, weakest }: Readonly<{ name: string; value: number; weakest?: boolean }>) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className={weakest ? 'font-semibold' : ''} style={{ color: weakest ? RW.orangeText : RW.textSecondary }}>
          {name}
          {weakest && ' · weakest'}
        </span>
        <span className="font-semibold tabular-nums" style={{ color: RW.text }}>
          {value}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: RW.borderLight }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${(value / 5) * 100}%`, backgroundColor: weakest ? RW.orangeText : RW.sidebar }}
        />
      </div>
    </div>
  );
}

function DepartmentBar({ name, score }: Readonly<{ name: string; score: number }>) {
  const color = getDepartmentColor(score);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span style={{ color: RW.textSecondary }}>{name}</span>
        <span className="font-semibold tabular-nums" style={{ color: RW.text }}>{score}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: RW.borderLight }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function UsageBar({ level, people, chatsPerQtr }: Readonly<{ level: string; people: number; chatsPerQtr: number }>) {
  const maxChats = Math.max(...COPILOT_USAGE_MODEL.readinessUsage.map(row => row.chatsPerQtr));
  const color = getUsageColor(level);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span style={{ color: RW.textSecondary }}>
          {level} <span style={{ color: RW.muted }}>· {people} people</span>
        </span>
        <span className="font-semibold tabular-nums" style={{ color: RW.text }}>{chatsPerQtr} chats/qtr</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: RW.borderLight }}>
        <div className="h-full rounded-full" style={{ width: `${(chatsPerQtr / maxChats) * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export function ReadinessVerticalDashboard() {
  const topInsights = [...SCENE1_INSIGHTS, ...SCENE2_INSIGHTS].slice(0, 6);
  const askObi = useAskObi();

  return (
    <div className="min-h-screen" style={{ backgroundColor: RW.pageBg, color: RW.text, fontFamily: RW.font }}>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-48 border-r px-4 py-5 lg:block" style={{ backgroundColor: RW.sidebar, borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="mb-8 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold" style={{ backgroundColor: RW.brandGold, color: RW.sidebar }}>
            O
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-white">Obi</p>
            <p className="text-[10px] uppercase tracking-wide text-white/45">AI Readiness</p>
          </div>
        </div>
        <nav className="space-y-1">
          {sidebarItems.map((item, i) => (
            <div
              key={item}
              className="rounded-lg px-3 py-2 text-xs font-medium"
              style={{
                backgroundColor: i === 0 ? 'rgba(234,179,8,0.16)' : 'transparent',
                color: i === 0 ? '#fff' : 'rgba(255,255,255,0.55)',
              }}
            >
              {item}
            </div>
          ))}
        </nav>
      </aside>

      <main className="mx-auto max-w-7xl px-4 py-5 lg:ml-48 lg:px-8">
        <header className="mb-5 rounded-xl border px-5 py-4" style={{ backgroundColor: RW.card, borderColor: RW.border, boxShadow: RW.cardShadow }}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: RW.purpleText }}>
                AI readiness dashboard · vertical format
              </p>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: RW.text }}>
                {ORG.name}
              </h1>
              <p className="mt-1 text-sm" style={{ color: RW.textSecondary }}>
                {ORG.leader}&apos;s view, presented as a scannable leader dashboard for A/B testing.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: RW.textSecondary }}>
              <span>{ORG.peopleInScope} people in scope</span>
              <span>·</span>
              <span>{ORG.departmentsCount} teams</span>
              <span>·</span>
              <span>{ORG.assessed} assessed</span>
              <button
                type="button"
                onClick={askObi.openGeneral}
                className="ml-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90 md:ml-2"
                style={{ backgroundColor: RW.sidebar, color: '#fff' }}
              >
                Ask Obi
              </button>
            </div>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Readiness average" value={`${ORG.readinessAvg}`} detail="Average score across assessed employees" />
          <MetricCard label="Assessment coverage" value={`${coveragePct}%`} detail={`${ORG.assessed} of ${ORG.peopleInScope} people assessed`} tone="purple" />
          <MetricCard label="AI maximization" value={`${aiMaximizationPct}%`} detail="Active-license rate × readiness average" tone="orange" />
          <MetricCard label="Estimated time saved" value={`${estimatedQuarterlyHoursSaved}`} detail="Conservative hours / quarter from chat + agents" tone="green" />
        </section>

        <section className="mb-6">
          <SectionTitle>Systemic intelligence</SectionTitle>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {topInsights.slice(0, 2).map(card => (
              <InsightPanel key={card.id} card={card} onAsk={() => askObi.openFromInsight(card)} />
            ))}
          </div>
        </section>

        <section className="mb-6">
          <SectionTitle>Top recommendations</SectionTitle>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {ACTION_CARDS.slice(0, 4).map(card => (
              <ActionPanel key={card.id} card={card} onAsk={() => askObi.openFromAction(card)} />
            ))}
          </div>
        </section>

        <section className="mb-6">
          <SectionTitle>Other key insights</SectionTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {topInsights.slice(2).map(card => (
              <InsightPanel key={card.id} card={card} onAsk={() => askObi.openFromInsight(card)} />
            ))}
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border p-5" style={{ backgroundColor: RW.card, borderColor: RW.border, boxShadow: RW.cardShadow }}>
            <SectionTitle>Readiness dimensions</SectionTitle>
            <div className="space-y-3">
              {ORG.dimensions.map(d => (
                <DimensionBar key={d.name} name={d.name} value={d.v} weakest={d.weakest} />
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-5" style={{ backgroundColor: RW.card, borderColor: RW.border, boxShadow: RW.cardShadow }}>
            <SectionTitle>Readiness distribution</SectionTitle>
            <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[150px_1fr]">
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[...LEVEL_CHART_DATA]} dataKey="value" innerRadius={42} outerRadius={68} paddingAngle={2} stroke="none">
                      {LEVEL_CHART_DATA.map(row => <Cell key={row.name} fill={row.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {LEVEL_CHART_DATA.map(row => (
                  <div key={row.name} className="flex items-center justify-between text-sm">
                    <span style={{ color: RW.textSecondary }}>{row.name}</span>
                    <span className="font-semibold tabular-nums" style={{ color: RW.text }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-xl border p-5" style={{ backgroundColor: RW.card, borderColor: RW.border, boxShadow: RW.cardShadow }}>
            <SectionTitle>Copilot usage linked to readiness</SectionTitle>
            <div className="mb-4 grid grid-cols-3 gap-3">
              <MetricCard label="Active" value={`${ORG.copilot.active}`} detail="licensed users" tone="green" />
              <MetricCard label="Dormant" value={`${ORG.copilot.dormant}`} detail={`${dormantLicensePct}% of licenses`} tone="orange" />
              <MetricCard label="Agents" value={`${ORG.copilot.agents}`} detail={`${ORG.copilot.builders} builders`} tone="purple" />
            </div>
            <p className="mb-4 text-sm" style={{ color: RW.textSecondary }}>
              Skilled users chat {skilledUsageMultiplier}x more than Beginners, making usage a proxy for whether readiness is becoming real operating leverage.
            </p>
            <div className="space-y-3">
              {COPILOT_USAGE_MODEL.readinessUsage.map(row => <UsageBar key={row.level} {...row} />)}
            </div>
          </div>

          <div className="rounded-xl border p-5" style={{ backgroundColor: RW.card, borderColor: RW.border, boxShadow: RW.cardShadow }}>
            <SectionTitle>Team detail</SectionTitle>
            <div className="space-y-3">
              {ORG.departments.map(dept => <DepartmentBar key={dept.name} name={dept.name} score={dept.score} />)}
            </div>
          </div>
        </section>

        <section className="mb-20">
          <SectionTitle>Remaining recommended actions</SectionTitle>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {ACTION_CARDS.slice(4).map(card => (
              <ActionPanel key={card.id} card={card} onAsk={() => askObi.openFromAction(card)} />
            ))}
          </div>
        </section>
      </main>
      <AskObiDrawer open={askObi.open} onClose={askObi.close} context={askObi.context} />
    </div>
  );
}
