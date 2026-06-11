import { useMemo } from 'react';
import { Minus } from 'lucide-react';
import {
  computeMetricsForNode,
  computeOrgGraphLayout,
  getSelectionState,
  graphEdgePath,
  GRAPH_PADDING,
  type GraphLayoutBox,
  type OrgNode,
  type OrgNodeMetrics,
  type SelectionState,
} from '../../../data/org-tree';
import { WF, WF_LEVEL } from './wireframe-theme';
import type { ReadinessLevel } from '../../../data/dashboard';

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
    <div className="flex h-1.5 w-full overflow-hidden mt-1.5" style={{ border: `1px solid ${WF.border}` }}>
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

function NodeCheckbox({ state }: { state: SelectionState }) {
  return (
    <span
      className="absolute top-1.5 right-1.5 w-3.5 h-3.5 flex items-center justify-center rounded-sm"
      style={{
        border: `1px solid ${WF.borderStrong}`,
        background: state === 'all' ? WF.fillActive : state === 'partial' ? WF.accentSoft : WF.surface,
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
}: {
  box: GraphLayoutBox;
  selectedIds: Set<string>;
  onToggleSelect: (node: OrgNode) => void;
}) {
  const { orgNode } = box;
  const metrics = computeMetricsForNode(orgNode);
  const selection = getSelectionState(orgNode, selectedIds);
  const isSelected = selection === 'all';
  const isPartial = selection === 'partial';

  const typeLabel =
    orgNode.type === 'company' ? 'Enterprise' : orgNode.type === 'division' ? 'Division' : 'Dept';

  return (
    <button
      type="button"
      onClick={() => onToggleSelect(orgNode)}
      className="absolute text-left cursor-pointer transition-shadow"
      style={{
        left: box.x + GRAPH_PADDING,
        top: box.y + GRAPH_PADDING,
        width: box.width,
        height: box.height,
        background: isSelected ? WF.fillActive : isPartial ? WF.surface : WF.surface,
        color: isSelected ? WF.textOnActive : WF.text,
        border: `1px solid ${isSelected ? WF.fillActive : WF.border}`,
        boxShadow: isSelected ? WF.shadowMd : isPartial ? WF.shadowSm : undefined,
      }}
    >
      <NodeCheckbox state={selection} />

      <div className="px-2.5 py-2 h-full flex flex-col justify-between pointer-events-none">
        <div>
          <p className="text-[9px] uppercase tracking-wider font-semibold opacity-70">{typeLabel}</p>
          <p className="text-[11px] font-bold leading-tight mt-0.5 line-clamp-2">{orgNode.name}</p>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-[8px] uppercase tracking-wider opacity-70">Avg</span>
            <span className="text-sm font-bold tabular-nums leading-none">
              {metrics.avgScore ?? '—'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[8px] tabular-nums opacity-70">
              {metrics.assessedCount}/{metrics.totalCount}
            </span>
          </div>
          {!isSelected && <LevelMiniBar metrics={metrics} />}
          {isSelected && (
            <div className="h-1.5 mt-1.5 border border-current opacity-40" style={{ background: 'rgba(255,255,255,0.2)' }} />
          )}
        </div>
      </div>
    </button>
  );
}

export function OrgGraphCanvas({
  selectedIds,
  onToggleSelect,
}: {
  selectedIds: Set<string>;
  onToggleSelect: (node: OrgNode) => void;
}) {
  const layout = useMemo(() => computeOrgGraphLayout(), []);

  const boxById = useMemo(() => {
    const map = new Map<string, GraphLayoutBox>();
    for (const box of layout.boxes) map.set(box.id, box);
    return map;
  }, [layout.boxes]);

  return (
    <div
      className="relative overflow-auto min-h-[280px] sm:min-h-[340px] max-h-[48vh] overscroll-contain touch-pan-x touch-pan-y"
      style={{
        WebkitOverflowScrolling: 'touch',
        background: WF.bg,
        backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
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
          />
        ))}
      </div>
    </div>
  );
}
