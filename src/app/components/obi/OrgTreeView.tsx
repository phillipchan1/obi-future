import { useState, useMemo, useCallback, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, Minus } from 'lucide-react';
import { useIsMobile } from '../ui/use-mobile';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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
import { WF, WF_LEVEL } from './wireframe-theme';
import { OrgGraphCanvas } from './OrgGraphCanvas';

function WireframeLevelPill({ level }: { level: ReadinessLevel }) {
  const fill = WF_LEVEL[level];
  return (
    <span
      className="inline-block px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wide"
      style={{
        borderColor: WF.border,
        background: fill,
        color: level === 'Skilled' ? WF.textOnActive : WF.text,
      }}
    >
      {level}
    </span>
  );
}

function SummaryStrip({ metrics }: { metrics: OrgNodeMetrics }) {
  const levelDistribution = useMemo(
    () =>
      (['Beginner', 'Learner', 'Familiar', 'Skilled'] as ReadinessLevel[]).map(level => ({
        level,
        count: metrics.levelDistribution[level],
        color: WF_LEVEL[level],
      })),
    [metrics],
  );

  const pieData = levelDistribution.filter(d => d.count > 0).map(d => ({
    name: d.level,
    value: d.count,
    color: d.color,
  }));

  return (
    <div className="flex-none grid grid-cols-1 sm:grid-cols-3 border-b border-black">
      <div className="px-4 sm:px-5 py-4 sm:border-r border-black border-b sm:border-b-0">
        <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: WF.muted }}>
          Readiness Average
        </p>
        <p className="text-2xl font-bold mt-1">{metrics.assessedCount ? metrics.avgScore : '—'}</p>
        <p className="text-[10px] mt-1" style={{ color: WF.muted }}>
          {metrics.assessedCount
            ? `Across ${metrics.assessedCount} assessed in selection`
            : 'Select org units or show all'}
        </p>
      </div>
      <div className="px-4 sm:px-5 py-4 sm:border-r border-black border-b sm:border-b-0">
        <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: WF.muted }}>
          Completions
        </p>
        <p className="text-2xl font-bold mt-1">{metrics.assessedCount}</p>
        <p className="text-[10px] mt-1" style={{ color: WF.muted }}>
          {metrics.totalCount} total in scope
        </p>
      </div>
      <div className="px-4 sm:px-5 py-3">
        <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: WF.muted }}>
          Level Distribution
        </p>
        <div className="flex items-center gap-3">
          <div className="w-[88px] h-[88px] flex-shrink-0">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={22}
                    outerRadius={40}
                    paddingAngle={1}
                    stroke={WF.border}
                    strokeWidth={1}
                  >
                    {pieData.map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: WF.bg,
                      border: `1px solid ${WF.border}`,
                      borderRadius: 0,
                      fontSize: 11,
                    }}
                    itemStyle={{ color: WF.text }}
                    formatter={(value: number, name: string) => [
                      `${value} (${metrics.assessedCount ? Math.round((value / metrics.assessedCount) * 100) : 0}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="w-full h-full border border-dashed border-black flex items-center justify-center text-[9px]"
                style={{ color: WF.muted }}
              >
                No data
              </div>
            )}
          </div>
          <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1 min-w-0">
            {levelDistribution.map(({ level, count, color }) => (
              <div key={level} className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 flex-shrink-0 border border-black" style={{ backgroundColor: color }} />
                <span className="text-[10px] truncate" style={{ color: WF.muted }}>
                  {level}
                </span>
                <span className="text-[10px] font-semibold ml-auto tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TreeSelectionCheckbox({ state }: { state: SelectionState }) {
  return (
    <span
      className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-sm"
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

function OrgTreeListRow({
  node,
  depth,
  expandedIds,
  selectedIds,
  onToggleExpand,
  onToggleSelect,
}: {
  node: OrgNode;
  depth: number;
  expandedIds: Set<string>;
  selectedIds: Set<string>;
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

  return (
    <div>
      <div
        className="flex items-stretch border-b border-black"
        style={{ background: isSelected ? WF.fillActive : isPartial ? WF.surface : WF.bg }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpand(node.id)}
            className="flex-shrink-0 flex items-center justify-center w-10"
            style={{ color: isSelected ? WF.textOnActive : WF.muted }}
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
          style={{ color: isSelected ? WF.textOnActive : WF.text, paddingLeft: depth > 0 ? 0 : undefined }}
        >
          <TreeSelectionCheckbox state={selection} />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-wider font-semibold opacity-70">{typeLabel}</p>
            <p className="text-sm font-bold leading-tight truncate">{node.name}</p>
            <p className="text-[10px] mt-0.5 tabular-nums opacity-80">
              Avg {metrics.avgScore ?? '—'} · {metrics.assessedCount}/{metrics.totalCount} assessed
            </p>
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
          onToggleExpand={onToggleExpand}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}

function OrgTreeList({
  selectedIds,
  onToggleSelect,
}: {
  selectedIds: Set<string>;
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
        onToggleExpand={toggleExpand}
        onToggleSelect={onToggleSelect}
      />
    </div>
  );
}

function EmployeeCards({ rows }: { rows: EmployeeRecord[] }) {
  return (
    <div className="divide-y divide-black">
      {rows.map(e => (
        <div key={e.id} className="px-4 py-3" style={{ background: WF.bg }}>
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
      <thead className="sticky top-0 z-10 border-b-2 border-black" style={{ background: WF.fill }}>
        <tr>
          {['Employee', 'Dept', 'Role', 'Score', 'Level'].map(col => (
            <th
              key={col}
              className="text-left px-3 py-2.5 font-semibold uppercase tracking-wider border-r border-black last:border-r-0"
              style={{ color: WF.muted }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(e => (
          <tr key={e.id} className="border-b border-black" style={{ background: WF.bg }}>
            <td className="px-3 py-2 border-r border-black font-medium whitespace-nowrap">
              {formatEmployeeId(e.id)}
            </td>
            <td className="px-3 py-2 border-r border-black" style={{ color: WF.muted }}>
              {e.department}
            </td>
            <td className="px-3 py-2 border-r border-black" style={{ color: WF.muted }}>
              {e.title}
            </td>
            <td className="px-3 py-2 border-r border-black tabular-nums">
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

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-none px-3 sm:px-5 py-3 border-b border-black flex items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: WF.muted }}>
            {isMobile ? 'Organization tree' : 'Organization graph'}
          </p>
          <p className="text-xs mt-0.5">{selectionLabel}</p>
        </div>
        {selectedIds.size > 0 && (
          <button
            type="button"
            onClick={clearSelection}
            className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 border border-black"
            style={{ background: WF.surface }}
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-none border-b border-black">
        {isMobile ? (
          <OrgTreeList selectedIds={selectedIds} onToggleSelect={toggleSelect} />
        ) : (
          <OrgGraphCanvas selectedIds={selectedIds} onToggleSelect={toggleSelect} />
        )}
      </div>

      <SummaryStrip metrics={selectionMetrics} />

      <div className="flex-none border-b border-black">
        <button
          type="button"
          onClick={() => setTableExpanded(v => !v)}
          className="w-full flex items-center justify-between px-3 sm:px-5 py-3 text-left"
          style={{ background: WF.bg }}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: WF.muted }}>
              Employee records
            </p>
            {!tableExpanded && (
              <p className="text-xs mt-0.5" style={{ color: WF.muted }}>
                {filteredEmployees.length} records in current scope · click to expand
              </p>
            )}
          </div>
          {tableExpanded ? (
            <ChevronDown size={16} style={{ color: WF.muted }} />
          ) : (
            <ChevronRight size={16} style={{ color: WF.muted }} />
          )}
        </button>
      </div>

      {tableExpanded && (
        <div className="flex-1 overflow-auto min-h-0">
          <EmployeeTable rows={filteredEmployees} />
        </div>
      )}
    </div>
  );
}
