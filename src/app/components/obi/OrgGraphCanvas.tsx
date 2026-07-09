import { useMemo } from 'react';
import { Minus } from 'lucide-react';
import {
  computeMetricsForNode,
  computeOrgGraphLayout,
  getSelectionState,
  graphEdgePath,
  GRAPH_NODE_HEIGHT,
  GRAPH_PADDING,
  type GraphLayoutBox,
  type OrgNode,
  type OrgNodeMetrics,
  type SelectionState,
} from '../../../data/org-tree';
import { WF, WF_LEVEL } from './wireframe-theme';
import type { ReadinessLevel } from '../../../data/dashboard';

export type OrgGraphDisplayOptions = {
  showScore: boolean;
  showHeadcount: boolean;
  showLevelMix: boolean;
  showDimensions: boolean;
};

export const DEFAULT_ORG_GRAPH_DISPLAY: OrgGraphDisplayOptions = {
  showScore: true,
  showHeadcount: true,
  showLevelMix: true,
  showDimensions: false,
};

export function getOrgGraphNodeHeight(options: OrgGraphDisplayOptions): number {
  let height = 56;
  if (options.showScore || options.showHeadcount) height += 22;
  if (options.showLevelMix) height += 14;
  if (options.showDimensions) height += 78;
  return Math.max(GRAPH_NODE_HEIGHT, height);
}

function LevelMiniBar({ metrics }: { metrics: OrgNodeMetrics }) {
  const total = metrics.assessedCount;
  if (!total) {
    return (
      <span className="text-[8px] italic" style={{ color: WF.muted }}>
        No assessments
      </span>
    );
  }

  const segments = (['Beginner', 'Learner', 'Familiar', 'Skilled'] as ReadinessLevel[])
    .map(level => ({ level, count: metrics.levelDistribution[level], color: WF_LEVEL[level] }))
    .filter(s => s.count > 0);

  return (
    <div className="mt-1.5 flex h-1.5 w-full overflow-hidden rounded-full" style={{ background: WF.fill }}>
      {segments.map(s => (
        <div
          key={s.level}
          style={{ width: `${(s.count / total) * 100}%`, background: s.color }}
          title={`${s.level}: ${s.count}`}
        />
      ))}
    </div>
  );
}

function DimensionTextList({ metrics }: { metrics: OrgNodeMetrics }) {
  if (metrics.dimensions.length === 0) {
    return (
      <p className="mt-1.5 text-[8px] italic" style={{ color: WF.muted }}>
        No dimensions
      </p>
    );
  }

  return (
    <ul className="mt-1.5 space-y-0.5">
      {metrics.dimensions.map(d => {
        const short =
          d.label === 'Mindset & Comfort'
            ? 'Mindset'
            : d.label === 'Usage Frequency'
              ? 'Usage'
              : d.label === 'Prompting Skill'
                ? 'Prompting'
                : d.label === 'Workflow Impact'
                  ? 'Workflow'
                  : d.label === 'Scaling & Enablement'
                    ? 'Scaling'
                    : d.label;
        const isWeak = metrics.lowest?.key === d.key;
        return (
          <li key={d.key} className="flex items-center justify-between gap-1 text-[8px] leading-tight">
            <span className="truncate" style={{ color: isWeak ? WF.red : WF.textSecondary }}>
              {short}
            </span>
            <span
              className="font-bold tabular-nums"
              style={{ color: isWeak ? WF.red : WF.text }}
            >
              {d.score100}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function NodeCheckbox({ state }: { state: SelectionState }) {
  return (
    <span
      className="absolute top-1.5 right-1.5 w-3.5 h-3.5 flex items-center justify-center rounded-sm"
      style={{
        border: `1px solid ${state === 'all' ? WF.accent : WF.borderStrong}`,
        background: state === 'all' ? WF.accent : state === 'partial' ? WF.accentSoft : WF.surface,
        color: state === 'all' ? WF.textOnActive : WF.textSecondary,
      }}
    >
      {state === 'all' && <span className="text-[8px] leading-none font-bold">✓</span>}
      {state === 'partial' && <Minus size={8} strokeWidth={3} />}
    </span>
  );
}

function GraphNodeCard({
  box,
  selectedIds,
  onToggleSelect,
  display,
}: {
  box: GraphLayoutBox;
  selectedIds: Set<string>;
  onToggleSelect: (node: OrgNode) => void;
  display: OrgGraphDisplayOptions;
}) {
  const { orgNode } = box;
  const metrics = computeMetricsForNode(orgNode);
  const selection = getSelectionState(orgNode, selectedIds);
  const isSelected = selection === 'all';
  const isPartial = selection === 'partial';

  const typeLabel =
    orgNode.type === 'company' ? 'Enterprise' : orgNode.type === 'division' ? 'Division' : 'Dept';

  const showMetricsBlock =
    display.showScore ||
    display.showHeadcount ||
    display.showLevelMix ||
    display.showDimensions;

  return (
    <button
      type="button"
      onClick={() => onToggleSelect(orgNode)}
      className="absolute text-left cursor-pointer transition-shadow rounded-xl"
      style={{
        left: box.x + GRAPH_PADDING,
        top: box.y + GRAPH_PADDING,
        width: box.width,
        height: box.height,
        background: isSelected ? WF.accentSoft : WF.surface,
        color: WF.text,
        border: `1px solid ${isSelected ? WF.accent : isPartial ? WF.purpleBorder : WF.border}`,
        boxShadow: isSelected || isPartial ? WF.shadowMd : WF.shadowSm,
      }}
    >
      <NodeCheckbox state={selection} />

      <div className="px-2.5 py-2 h-full flex flex-col justify-between pointer-events-none overflow-hidden">
        <div>
          <p className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: WF.muted }}>
            {typeLabel}
          </p>
          <p className="text-[11px] font-bold leading-tight mt-0.5 line-clamp-2">{orgNode.name}</p>
        </div>

        {showMetricsBlock && (
          <div>
            {(display.showScore || display.showHeadcount) && (
              <div className="flex items-baseline justify-between gap-1">
                {display.showScore ? (
                  <>
                    <span className="text-[8px] uppercase tracking-wider" style={{ color: WF.muted }}>Avg</span>
                    <span className="text-sm font-bold tabular-nums leading-none">
                      {metrics.avgScore ?? '—'}
                    </span>
                  </>
                ) : (
                  <span className="text-[8px] uppercase tracking-wider" style={{ color: WF.muted }}>
                    Assessed
                  </span>
                )}
              </div>
            )}
            {display.showHeadcount && (
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[8px] tabular-nums" style={{ color: WF.muted }}>
                  {metrics.assessedCount}/{metrics.totalCount}
                </span>
                {!display.showScore && (
                  <span className="text-[8px] font-semibold tabular-nums" style={{ color: WF.orange }}>
                    {metrics.participationPct}%
                  </span>
                )}
              </div>
            )}
            {display.showLevelMix && <LevelMiniBar metrics={metrics} />}
            {display.showDimensions && <DimensionTextList metrics={metrics} />}
          </div>
        )}
      </div>
    </button>
  );
}

export function OrgGraphCanvas({
  selectedIds,
  onToggleSelect,
  display = DEFAULT_ORG_GRAPH_DISPLAY,
}: {
  selectedIds: Set<string>;
  onToggleSelect: (node: OrgNode) => void;
  display?: OrgGraphDisplayOptions;
}) {
  const nodeHeight = getOrgGraphNodeHeight(display);
  const layout = useMemo(() => computeOrgGraphLayout(undefined, nodeHeight), [nodeHeight]);

  const boxById = useMemo(() => {
    const map = new Map<string, GraphLayoutBox>();
    for (const box of layout.boxes) map.set(box.id, box);
    return map;
  }, [layout.boxes]);

  return (
    <div
      className="relative overflow-auto min-h-[360px] sm:min-h-[440px] max-h-[62vh] overscroll-contain touch-pan-x touch-pan-y"
      style={{
        WebkitOverflowScrolling: 'touch',
        background: WF.bg,
        backgroundImage: `
          linear-gradient(to right, rgba(79,70,229,0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(79,70,229,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
      }}
    >
      <div
        className="relative mx-auto"
        style={{ width: layout.width, height: layout.height, minWidth: layout.width }}
      >
        <svg
          className="absolute inset-0 pointer-events-none"
          width={layout.width}
          height={layout.height}
          aria-hidden
        >
          {layout.edges.map(edge => {
            const from = boxById.get(edge.fromId);
            const to = boxById.get(edge.toId);
            if (!from || !to) return null;

            const path = graphEdgePath(
              {
                ...from,
                x: from.x + GRAPH_PADDING,
                y: from.y + GRAPH_PADDING,
              },
              {
                ...to,
                x: to.x + GRAPH_PADDING,
                y: to.y + GRAPH_PADDING,
              },
            );

            const highlighted =
              getSelectionState(from.orgNode, selectedIds) !== 'none' &&
              getSelectionState(to.orgNode, selectedIds) !== 'none';

            return (
              <path
                key={`${edge.fromId}-${edge.toId}`}
                d={path}
                fill="none"
                stroke={WF.border}
                strokeWidth={highlighted ? 2.5 : 1.5}
                strokeDasharray={highlighted ? undefined : 'none'}
                opacity={highlighted ? 1 : 0.55}
              />
            );
          })}
        </svg>

        {layout.boxes.map(box => (
          <GraphNodeCard
            key={box.id}
            box={box}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
            display={display}
          />
        ))}
      </div>
    </div>
  );
}
