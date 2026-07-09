import { useState, useMemo, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, Minus, TrendingUp, Sparkles, Settings2 } from 'lucide-react';
import { useIsMobile } from '../ui/use-mobile';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  EMPLOYEES,
  formatEmployeeId,
  hasCompletedAssessment,
  type ReadinessLevel,
  type EmployeeRecord,
} from '../../../data/dashboard';
import {
  computeMetricsForDepartments,
  computeMetricsForNode,
  getDepartmentsForSelection,
  getDescendantIds,
  getOrgNode,
  getSelectionState,
  ORG_ROOT,
  type OrgNode,
  type OrgNodeMetrics,
  type SelectionState,
} from '../../../data/org-tree';
import {
  getOrgActionInsights,
  type ActionInsightCard,
} from '../../../data/org-action-insights';
import { WF, WF_LEVEL } from './wireframe-theme';
import {
  OrgGraphCanvas,
  DEFAULT_ORG_GRAPH_DISPLAY,
  type OrgGraphDisplayOptions,
} from './OrgGraphCanvas';
import { CopilotPromptModal } from './readiness-wrapped/CopilotPromptModal';

const LEVEL_ORDER: ReadinessLevel[] = ['Beginner', 'Learner', 'Familiar', 'Skilled'];

function WireframeLevelPill({ level }: { level: ReadinessLevel }) {
  const fill = WF_LEVEL[level];
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
      style={{ background: fill }}
    >
      {level}
    </span>
  );
}

function OrganizationOverviewCard({
  metrics,
  scopeLabel,
}: Readonly<{ metrics: OrgNodeMetrics; scopeLabel: string }>) {
  const participationPct = metrics.participationPct;
  const mix = LEVEL_ORDER.map(level => ({
    level,
    count: metrics.levelDistribution[level],
    pct: metrics.assessedCount
      ? Math.round((metrics.levelDistribution[level] / metrics.assessedCount) * 100)
      : 0,
    color: WF_LEVEL[level],
  }));

  return (
    <article
      className="rounded-2xl border p-5 sm:p-6"
      style={{ background: WF.surface, borderColor: WF.border, boxShadow: WF.shadowCard }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: WF.muted }}>
        Organization
      </p>
      <h2 className="mt-1 text-lg font-bold tracking-tight" style={{ color: WF.text }}>
        {scopeLabel}
      </h2>

      <div className="mt-5 flex flex-wrap items-end gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: WF.muted }}>
            Group readiness score
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums leading-none" style={{ color: WF.text }}>
            {metrics.avgScore ?? '—'}
            <span className="ml-1 text-base font-semibold" style={{ color: WF.muted }}>
              / 100
            </span>
          </p>
        </div>
        {metrics.assessedCount > 0 && (
          <div
            className="mb-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ background: WF.greenSoft, color: WF.green }}
          >
            <TrendingUp size={12} strokeWidth={2.5} />
            +{metrics.trendDelta} pts since previous assessment
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
            <span style={{ color: WF.textSecondary }}>Unique employees assessed</span>
            <span className="font-semibold tabular-nums" style={{ color: WF.text }}>
              {metrics.assessedCount} of {metrics.totalCount}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full" style={{ background: WF.fill }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${participationPct}%`,
                background: `linear-gradient(90deg, ${WF.purple}, ${WF.blue})`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs">
          <span style={{ color: WF.textSecondary }}>Participation rate</span>
          <span className="text-sm font-bold tabular-nums" style={{ color: WF.orange }}>
            {participationPct}%
          </span>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: WF.muted }}>
          Readiness mix
        </p>
        <div className="flex h-3 overflow-hidden rounded-full" style={{ background: WF.fill }}>
          {mix.filter(m => m.count > 0).map(m => (
            <div
              key={m.level}
              style={{ width: `${m.pct}%`, background: m.color }}
              title={`${m.level}: ${m.count} (${m.pct}%)`}
            />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-4">
          {mix.map(m => (
            <div key={m.level} className="flex items-center gap-1.5 min-w-0">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: m.color }} />
              <span className="truncate text-[11px]" style={{ color: WF.textSecondary }}>
                {m.level}
              </span>
              <span className="ml-auto text-[11px] font-semibold tabular-nums" style={{ color: WF.text }}>
                {m.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function FiveDimensionCard({ metrics }: Readonly<{ metrics: OrgNodeMetrics }>) {
  const radarData = metrics.dimensions.map(d => ({
    dimension: d.label,
    short: d.label.split(/[\s&]+/)[0],
    value: d.score100,
    fullMark: 100,
  }));

  return (
    <article
      className="rounded-2xl border p-5 sm:p-6"
      style={{ background: WF.surface, borderColor: WF.border, boxShadow: WF.shadowCard }}
    >
      <h2 className="text-lg font-bold tracking-tight" style={{ color: WF.text }}>
        Five-Dimension Readiness
      </h2>
      <p className="mt-1 text-sm" style={{ color: WF.textSecondary }}>
        Aggregate readiness across five OBI dimensions
      </p>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="mx-auto h-[220px] w-full max-w-[260px] shrink-0">
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke={WF.borderStrong} />
                <PolarAngleAxis
                  dataKey="short"
                  tick={{ fill: WF.muted, fontSize: 10 }}
                />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Readiness"
                  dataKey="value"
                  stroke={WF.purple}
                  fill={WF.purple}
                  fillOpacity={0.28}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="flex h-full items-center justify-center rounded-xl border border-dashed text-xs"
              style={{ borderColor: WF.border, color: WF.muted }}
            >
              No assessed employees
            </div>
          )}
        </div>

        <ul className="flex-1 space-y-2.5 min-w-0">
          {metrics.dimensions.map(d => (
            <li key={d.key} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: WF.purple }} />
                <span className="truncate text-sm" style={{ color: WF.textSecondary }}>
                  {d.label}
                </span>
              </div>
              <span className="text-sm font-bold tabular-nums" style={{ color: WF.text }}>
                {d.score100}
              </span>
            </li>
          ))}
          {metrics.dimensions.length === 0 && (
            <li className="text-sm" style={{ color: WF.muted }}>
              Select a pocket with assessed employees to see dimensions.
            </li>
          )}
        </ul>
      </div>
    </article>
  );
}

function DimensionInsightCards({ metrics }: Readonly<{ metrics: OrgNodeMetrics }>) {
  const cards = [
    metrics.strongest && {
      id: 'strongest',
      eyebrow: 'Strongest dimension',
      accent: WF.green,
      title: metrics.strongest.label,
      metric: `${metrics.strongest.score100} median`,
      body: 'Highest aggregate score across assessed people in this view.',
    },
    metrics.lowest && {
      id: 'lowest',
      eyebrow: 'Lowest dimension',
      accent: WF.red,
      title: metrics.lowest.label,
      metric: `${metrics.lowest.score100} median`,
      body: 'Primary enablement gap — the dimension holding readiness back.',
    },
    metrics.largestSpread && {
      id: 'spread',
      eyebrow: 'Largest spread',
      accent: WF.amber,
      title: metrics.largestSpread.label,
      metric: `${metrics.largestSpread.spread100} pt range`,
      body: 'Widest variation across people — coaching impact may vary significantly.',
    },
  ].filter(Boolean) as Array<{
    id: string;
    eyebrow: string;
    accent: string;
    title: string;
    metric: string;
    body: string;
  }>;

  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {cards.map(card => (
        <article
          key={card.id}
          className="relative overflow-hidden rounded-2xl border p-5"
          style={{ background: WF.surface, borderColor: WF.border, boxShadow: WF.shadowCard }}
        >
          <span
            className="absolute left-0 top-0 h-full w-1"
            style={{ background: card.accent }}
            aria-hidden
          />
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: card.accent }}
          >
            {card.eyebrow}
          </p>
          <h3 className="mt-2 text-base font-bold" style={{ color: WF.text }}>
            {card.title}
          </h3>
          <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: card.accent }}>
            {card.metric}
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: WF.textSecondary }}>
            {card.body}
          </p>
        </article>
      ))}
    </div>
  );
}

function ActionInsightsSection({
  cards,
  onPlanInCopilot,
}: Readonly<{
  cards: ActionInsightCard[];
  onPlanInCopilot: (card: ActionInsightCard) => void;
}>) {
  if (cards.length === 0) return null;

  return (
    <div className="px-3 py-5 sm:px-5" style={{ background: WF.bg }}>
      <div className="mb-4 flex items-start gap-3">
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ background: WF.accentSoft, color: WF.accent }}
        >
          <Sparkles size={16} />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: WF.muted }}>
            What should we do next
          </p>
          <h2 className="mt-0.5 text-lg font-bold" style={{ color: WF.text }}>
            Recommended actions
          </h2>
          <p className="mt-1 text-sm" style={{ color: WF.textSecondary }}>
            AI-generated from the current selection — story, evidence, and a Copilot plan you can take forward.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {cards.map(card => (
          <article
            key={card.id}
            className="flex flex-col rounded-2xl border p-5"
            style={{ background: WF.surface, borderColor: WF.border, boxShadow: WF.shadowCard }}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ background: WF.accentSoft, color: WF.accent }}
              >
                {card.badge}
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                style={{ background: WF.fill, color: WF.textSecondary }}
              >
                {card.timing}
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                style={{ background: WF.greenSoft, color: WF.green }}
              >
                {card.impact} impact
              </span>
            </div>

            <h3 className="text-base font-bold leading-snug" style={{ color: WF.text }}>
              {card.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: WF.textSecondary }}>
              {card.story}
            </p>

            <div className="mt-4 rounded-xl p-3" style={{ background: WF.surfaceMuted }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: WF.muted }}>
                Evidence
              </p>
              <ul className="mt-2 space-y-1.5">
                {card.evidence.map(point => (
                  <li key={point} className="flex gap-2 text-xs leading-relaxed" style={{ color: WF.textSecondary }}>
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: WF.accent }} />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-4 text-sm leading-relaxed" style={{ color: WF.text }}>
              <span className="font-semibold">Recommendation: </span>
              {card.recommendation}
            </p>

            <button
              type="button"
              onClick={() => onPlanInCopilot(card)}
              className="mt-4 inline-flex items-center justify-center gap-2 self-start rounded-xl px-3.5 py-2 text-xs font-semibold transition-opacity hover:opacity-90"
              style={{ background: WF.accent, color: WF.textOnActive }}
            >
              Plan this out in Copilot →
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

function ExecutiveOverview({
  metrics,
  scopeLabel,
}: Readonly<{ metrics: OrgNodeMetrics; scopeLabel: string }>) {
  return (
    <div className="space-y-4 px-3 py-4 sm:px-5" style={{ background: WF.bg }}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <OrganizationOverviewCard metrics={metrics} scopeLabel={scopeLabel} />
        <FiveDimensionCard metrics={metrics} />
      </div>
      <DimensionInsightCards metrics={metrics} />
    </div>
  );
}

function TreeSelectionCheckbox({ state }: { state: SelectionState }) {
  return (
    <span
      className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-md"
      style={{
        border: `1px solid ${WF.borderStrong}`,
        background: state === 'all' ? WF.fillActive : state === 'partial' ? WF.accentSoft : WF.surface,
        color: state === 'all' ? WF.textOnActive : WF.textSecondary,
      }}
    >
      {state === 'all' && <span className="text-[10px] leading-none font-bold">✓</span>}
      {state === 'partial' && <Minus size={10} strokeWidth={3} />}
    </span>
  );
}

function OrgTreeDisplaySettings({
  display,
  onChange,
}: Readonly<{
  display: OrgGraphDisplayOptions;
  onChange: (next: OrgGraphDisplayOptions) => void;
}>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    globalThis.window.addEventListener('pointerdown', onPointerDown);
    globalThis.window.addEventListener('keydown', onKey);
    return () => {
      globalThis.window.removeEventListener('pointerdown', onPointerDown);
      globalThis.window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggles: Array<{ key: keyof OrgGraphDisplayOptions; label: string; hint: string }> = [
    { key: 'showScore', label: 'Readiness score', hint: 'Avg score on each node' },
    { key: 'showHeadcount', label: 'Assessed headcount', hint: 'Assessed / total people' },
    { key: 'showLevelMix', label: 'Level mix bar', hint: 'Beginner → Skilled strip' },
    {
      key: 'showDimensions',
      label: 'Five dimensions',
      hint: 'Mindset, Usage, Prompting, Workflow, Scaling as text scores — cards grow taller',
    },
  ];

  const activeCount = toggles.filter(t => display[t.key]).length;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Choose what each org node shows"
        className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left transition-colors"
        style={{
          background: open ? WF.accentSoft : WF.surface,
          borderColor: open ? WF.accent : WF.borderStrong,
          color: open ? WF.accent : WF.textSecondary,
        }}
      >
        <Settings2 size={13} />
        <span className="leading-tight">
          <span className="block text-[10px] font-semibold uppercase tracking-wider">
            Node details
          </span>
          <span className="block text-[9px] font-medium normal-case tracking-normal" style={{ color: WF.muted }}>
            {activeCount} layers · show / hide
          </span>
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="What to show on org nodes"
          className="absolute right-0 top-full z-30 mt-2 w-80 rounded-xl border p-3 shadow-lg"
          style={{ background: WF.surface, borderColor: WF.border, boxShadow: WF.shadowCard }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: WF.muted }}>
            What each node shows
          </p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: WF.textSecondary }}>
            These toggles only change the org tree cards — not the dashboard below. Dimension scores expand cards downward so you can compare side by side.
          </p>
          <ul className="mt-3 space-y-2">
            {toggles.map(item => (
              <li key={item.key}>
                <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-black/[0.03]">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={display[item.key]}
                    onChange={e => onChange({ ...display, [item.key]: e.target.checked })}
                  />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold" style={{ color: WF.text }}>
                      {item.label}
                    </span>
                    <span className="block text-[10px]" style={{ color: WF.muted }}>
                      {item.hint}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => onChange(DEFAULT_ORG_GRAPH_DISPLAY)}
            className="mt-3 w-full rounded-lg border px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ borderColor: WF.border, color: WF.textSecondary, background: WF.fill }}
          >
            Reset to default
          </button>
        </div>
      )}
    </div>
  );
}

function OrgTreeListRow({
  node,
  depth,
  expandedIds,
  selectedIds,
  display,
  onToggleExpand,
  onToggleSelect,
}: {
  node: OrgNode;
  depth: number;
  expandedIds: Set<string>;
  selectedIds: Set<string>;
  display: OrgGraphDisplayOptions;
  onToggleExpand: (id: string) => void;
  onToggleSelect: (node: OrgNode) => void;
}) {
  const children = node.children ?? [];
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const selection = getSelectionState(node, selectedIds);
  const metrics = computeMetricsForNode(node);
  const isSelected = selection === 'all';
  const isPartial = selection === 'partial';

  const typeLabel =
    node.type === 'company' ? 'Enterprise' : node.type === 'division' ? 'Division' : 'Dept';

  const metricBits: string[] = [];
  if (display.showScore) metricBits.push(`Avg ${metrics.avgScore ?? '—'}`);
  if (display.showHeadcount) metricBits.push(`${metrics.assessedCount}/${metrics.totalCount} assessed`);

  return (
    <div>
      <div
        className="flex items-stretch border-b"
        style={{
          borderColor: WF.border,
          background: isSelected ? WF.accentSoft : isPartial ? WF.surfaceMuted : WF.surface,
        }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpand(node.id)}
            className="flex-shrink-0 flex items-center justify-center w-10"
            style={{ color: WF.muted }}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <span className="w-10 flex-shrink-0" aria-hidden />
        )}

        <button
          type="button"
          onClick={() => onToggleSelect(node)}
          className="flex-1 min-w-0 flex items-center gap-3 py-3 pr-3 text-left"
          style={{ color: WF.text, paddingLeft: depth > 0 ? 0 : undefined }}
        >
          <TreeSelectionCheckbox state={selection} />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: WF.muted }}>
              {typeLabel}
            </p>
            <p className="text-sm font-bold leading-tight truncate">{node.name}</p>
            {metricBits.length > 0 && (
              <p className="text-[10px] mt-0.5 tabular-nums truncate" style={{ color: WF.textSecondary }}>
                {metricBits.join(' · ')}
              </p>
            )}
            {display.showLevelMix && metrics.assessedCount > 0 && (
              <div className="mt-1.5 flex h-1.5 w-full max-w-[180px] overflow-hidden rounded-full" style={{ background: WF.fill }}>
                {LEVEL_ORDER.map(level => {
                  const count = metrics.levelDistribution[level];
                  if (!count) return null;
                  return (
                    <div
                      key={level}
                      style={{
                        width: `${(count / metrics.assessedCount) * 100}%`,
                        background: WF_LEVEL[level],
                      }}
                    />
                  );
                })}
              </div>
            )}
            {display.showDimensions && metrics.dimensions.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {metrics.dimensions.map(d => {
                  const isWeak = metrics.lowest?.key === d.key;
                  return (
                    <li key={d.key} className="flex items-center justify-between gap-2 text-[10px]">
                      <span style={{ color: isWeak ? WF.red : WF.textSecondary }}>{d.label}</span>
                      <span className="font-bold tabular-nums" style={{ color: isWeak ? WF.red : WF.text }}>
                        {d.score100}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </button>
      </div>

      {hasChildren && isExpanded && children.map(child => (
        <OrgTreeListRow
          key={child.id}
          node={child}
          depth={depth + 1}
          expandedIds={expandedIds}
          selectedIds={selectedIds}
          display={display}
          onToggleExpand={onToggleExpand}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}

function OrgTreeList({
  selectedIds,
  display,
  onToggleSelect,
}: {
  selectedIds: Set<string>;
  display: OrgGraphDisplayOptions;
  onToggleSelect: (node: OrgNode) => void;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const ids = new Set<string>([ORG_ROOT.id]);
    for (const division of ORG_ROOT.children ?? []) ids.add(division.id);
    return ids;
  });

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="max-h-[50vh] overflow-y-auto overscroll-contain">
      <OrgTreeListRow
        node={ORG_ROOT}
        depth={0}
        expandedIds={expandedIds}
        selectedIds={selectedIds}
        display={display}
        onToggleExpand={toggleExpand}
        onToggleSelect={onToggleSelect}
      />
    </div>
  );
}

function EmployeeCards({ rows }: { rows: EmployeeRecord[] }) {
  return (
    <div className="divide-y" style={{ borderColor: WF.border }}>
      {rows.map(e => (
        <div key={e.id} className="px-4 py-3 border-b" style={{ background: WF.surface, borderColor: WF.border }}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold">{formatEmployeeId(e.id)}</p>
            {hasCompletedAssessment(e) && e.level ? (
              <WireframeLevelPill level={e.level} />
            ) : (
              <span className="text-[10px] italic" style={{ color: WF.muted }}>Not finished</span>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: WF.muted }}>{e.title}</p>
          <div className="flex items-center justify-between mt-2 text-[10px]">
            <span style={{ color: WF.muted }}>{e.department}</span>
            <span className="font-semibold tabular-nums">
              {hasCompletedAssessment(e) ? `Score ${e.finalScore}` : '—'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmployeeTable({ rows }: { rows: EmployeeRecord[] }) {
  const isMobile = useIsMobile();

  if (rows.length === 0) {
    return (
      <p className="text-xs py-8 text-center" style={{ color: WF.muted }}>
        No employees match the current selection.
      </p>
    );
  }

  if (isMobile) return <EmployeeCards rows={rows} />;

  return (
    <table className="w-full text-xs border-collapse">
      <thead className="sticky top-0 z-10 border-b" style={{ background: WF.fill, borderColor: WF.border }}>
        <tr>
          {['Employee', 'Dept', 'Role', 'Score', 'Level'].map(col => (
            <th
              key={col}
              className="text-left px-3 py-2.5 font-semibold uppercase tracking-wider border-r last:border-r-0"
              style={{ color: WF.muted, borderColor: WF.border }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(e => (
          <tr key={e.id} className="border-b" style={{ background: WF.surface, borderColor: WF.border }}>
            <td className="px-3 py-2 border-r font-medium whitespace-nowrap" style={{ borderColor: WF.border }}>
              {formatEmployeeId(e.id)}
            </td>
            <td className="px-3 py-2 border-r" style={{ color: WF.muted, borderColor: WF.border }}>
              {e.department}
            </td>
            <td className="px-3 py-2 border-r" style={{ color: WF.muted, borderColor: WF.border }}>
              {e.title}
            </td>
            <td className="px-3 py-2 border-r tabular-nums" style={{ borderColor: WF.border }}>
              {hasCompletedAssessment(e) ? e.finalScore : (
                <span className="italic" style={{ color: WF.muted }}>Not finished</span>
              )}
            </td>
            <td className="px-3 py-2">
              {hasCompletedAssessment(e) && e.level ? (
                <WireframeLevelPill level={e.level} />
              ) : (
                <span className="italic" style={{ color: WF.muted }}>Not finished</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function OrgTreeView() {
  const isMobile = useIsMobile();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [tableExpanded, setTableExpanded] = useState(false);
  const [copilotCard, setCopilotCard] = useState<ActionInsightCard | null>(null);
  const [display, setDisplay] = useState<OrgGraphDisplayOptions>(DEFAULT_ORG_GRAPH_DISPLAY);
  const recordsRef = useRef<HTMLDivElement>(null);

  const toggleSelect = useCallback((node: OrgNode) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      const state = getSelectionState(node, prev);
      const ids = getDescendantIds(node);
      if (state === 'all') {
        for (const id of ids) next.delete(id);
      } else {
        for (const id of ids) next.add(id);
      }
      return next;
    });
  }, []);

  const selectedDepartments = useMemo(
    () => (selectedIds.size ? getDepartmentsForSelection(selectedIds) : null),
    [selectedIds],
  );

  const selectionMetrics = useMemo(
    () => computeMetricsForDepartments(selectedDepartments),
    [selectedDepartments],
  );

  const filteredEmployees = useMemo(() => {
    if (!selectedDepartments?.length) return EMPLOYEES;
    return EMPLOYEES.filter(e => selectedDepartments.includes(e.department));
  }, [selectedDepartments]);

  const scopeLabel = useMemo(() => {
    if (selectedIds.size === 0) return `${ORG_ROOT.name}'s Organization`;
    const names = [...selectedIds]
      .map(id => getOrgNode(id)?.name)
      .filter(Boolean) as string[];
    if (names.length === 1) return names[0];
    if (names.length <= 3) return names.join(', ');
    return `${names.length} selected org units`;
  }, [selectedIds]);

  const actionCards = useMemo(
    () => getOrgActionInsights(filteredEmployees, selectedDepartments, scopeLabel),
    [filteredEmployees, selectedDepartments, scopeLabel],
  );

  const selectionLabel = useMemo((): ReactNode => {
    if (selectedIds.size === 0) {
      return isMobile
        ? 'Tap org units to select pockets — expand divisions to browse'
        : 'Click nodes to select org pockets — scroll the graph to explore';
    }
    const names = [...selectedIds]
      .map(id => getOrgNode(id)?.name)
      .filter(Boolean) as string[];
    if (names.length <= 3) return `Filtered to: ${names.join(', ')}`;
    return `Filtered to ${names.length} org units`;
  }, [selectedIds, isMobile]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const toggleRecords = useCallback(() => {
    setTableExpanded(v => {
      const next = !v;
      if (next) {
        // Wait a tick so the table mounts, then scroll it into view.
        globalThis.window.setTimeout(() => {
          recordsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
      return next;
    });
  }, []);

  return (
    <div className="h-full overflow-y-auto overscroll-contain">
      <CopilotPromptModal
        open={copilotCard !== null}
        title={copilotCard?.copilotTitle ?? ''}
        subtitle="Preview the pre-populated prompt, then copy it into Copilot to plan this action."
        prompt={copilotCard?.copilotPrompt ?? ''}
        onClose={() => setCopilotCard(null)}
      />

      <div
        className="px-3 sm:px-5 py-3 border-b flex items-start sm:items-center justify-between gap-3"
        style={{ borderColor: WF.border, background: WF.surface }}
      >
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: WF.muted }}>
            Organization filter
          </p>
          <p className="text-xs mt-0.5" style={{ color: WF.textSecondary }}>
            {selectionLabel}
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <OrgTreeDisplaySettings display={display} onChange={setDisplay} />
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-lg text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1.5 border"
              style={{ background: WF.surface, borderColor: WF.borderStrong, color: WF.textSecondary }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="border-b" style={{ borderColor: WF.border }}>
        {isMobile ? (
          <OrgTreeList selectedIds={selectedIds} display={display} onToggleSelect={toggleSelect} />
        ) : (
          <OrgGraphCanvas selectedIds={selectedIds} onToggleSelect={toggleSelect} display={display} />
        )}
      </div>

      <ExecutiveOverview metrics={selectionMetrics} scopeLabel={scopeLabel} />

      <ActionInsightsSection cards={actionCards} onPlanInCopilot={setCopilotCard} />

      <div
        ref={recordsRef}
        className="border-y"
        style={{ borderColor: WF.border, background: WF.surface }}
      >
        <button
          type="button"
          onClick={toggleRecords}
          className="w-full flex items-center justify-between px-3 sm:px-5 py-3 text-left"
          style={{ background: WF.surface }}
          aria-expanded={tableExpanded}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: WF.muted }}>
              Employee records
            </p>
            <p className="text-xs mt-0.5" style={{ color: WF.muted }}>
              {filteredEmployees.length} records in current scope
              {tableExpanded ? ' · click to collapse' : ' · click to expand'}
            </p>
          </div>
          {tableExpanded ? (
            <ChevronDown size={16} style={{ color: WF.muted }} />
          ) : (
            <ChevronRight size={16} style={{ color: WF.muted }} />
          )}
        </button>

        {tableExpanded && (
          <div className="border-t pb-8" style={{ borderColor: WF.border }}>
            <EmployeeTable rows={filteredEmployees} />
          </div>
        )}
      </div>
    </div>
  );
}
