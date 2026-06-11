import { useState, useMemo, useCallback, Fragment } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ArrowUpDown,
  MessageSquare,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Tooltip,
} from 'recharts';
import {
  formatEmployeeId,
  hasCompletedAssessment,
  type EmployeeRecord,
  type ReadinessLevel,
} from '../../../data/dashboard';
import {
  ALL_DEPARTMENTS,
  CANNED_VIEWS,
  EXEC_LAST_UPDATED,
  computeExecKpis,
  filterEmployeesByHeatCell,
  getDeptScoreRows,
  getExecInsightCards,
  getHeatMapCells,
  getLevelDistribution,
  QUARTER_SKILLED_TREND,
  scopeEmployees,
  type CannedViewId,
  type ExecInsightCard,
  type ExecInsightTone,
} from '../../../data/exec-intelligence';
import { WF, WF_LEVEL, wfCardStyle, wfSectionStyle } from './wireframe-theme';

const INSIGHT_BORDER: Record<ExecInsightTone, string> = {
  urgent: '#DC2626',
  warning: '#D97706',
  positive: '#16A34A',
  info: '#2563EB',
};

const BAR_FILL: Record<'red' | 'amber' | 'green', string> = {
  red: '#DC2626',
  amber: '#D97706',
  green: '#16A34A',
};

const DISRUPTION_BADGE: Record<string, { bg: string; text: string }> = {
  Low: { bg: '#DCFCE7', text: '#166534' },
  Medium: { bg: '#FEF3C7', text: '#92400E' },
  High: { bg: '#FEE2E2', text: '#991B1B' },
};

type SortKey = 'id' | 'department' | 'title' | 'finalScore' | 'level';
type SortDir = 'asc' | 'desc';

const LEVEL_ORDER: Record<ReadinessLevel, number> = {
  Beginner: 0,
  Learner: 1,
  Familiar: 2,
  Skilled: 3,
};

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-5 py-3" style={wfSectionStyle}>
      <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: WF.textSecondary }}>
        {title}
      </p>
      {subtitle && (
        <p className="text-[10px] mt-0.5" style={{ color: WF.muted }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  detail,
  alert,
}: {
  label: string;
  value: React.ReactNode;
  detail?: string;
  alert?: boolean;
}) {
  return (
    <div
      className="px-4 py-3 min-w-0 rounded-sm"
      style={{
        ...wfCardStyle,
        background: alert ? '#FEF2F2' : WF.surface,
        borderColor: alert ? '#FECACA' : WF.border,
      }}
    >
      <p className="text-[9px] font-medium uppercase tracking-wider" style={{ color: WF.muted }}>
        {label}
      </p>
      <div className="mt-1">{value}</div>
      {detail && (
        <p className="text-[10px] mt-1" style={{ color: WF.muted }}>
          {detail}
        </p>
      )}
    </div>
  );
}

function InsightCard({
  card,
  onAskObi,
}: {
  card: ExecInsightCard;
  onAskObi: (text: string) => void;
}) {
  return (
    <div
      className="rounded-sm p-4 flex flex-col min-h-[168px]"
      style={{
        ...wfCardStyle,
        borderLeftWidth: 3,
        borderLeftColor: INSIGHT_BORDER[card.tone],
      }}
    >
      <span
        className="inline-block self-start text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 mb-2 rounded-sm"
        style={{ background: WF.surfaceMuted, color: WF.textSecondary }}
      >
        {card.badge}
      </span>
      <p className="text-sm font-semibold leading-snug" style={{ color: WF.text }}>{card.title}</p>
      <p className="text-xs mt-2 leading-relaxed flex-1" style={{ color: WF.textSecondary }}>
        {card.explanation[0]} {card.explanation[1]}
      </p>
      <button
        type="button"
        onClick={() => onAskObi(card.chatPrefill)}
        className="mt-3 self-start flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-sm"
        style={{
          background: WF.surfaceMuted,
          color: WF.textSecondary,
          border: `1px solid ${WF.border}`,
        }}
      >
        <MessageSquare size={10} />
        Ask Obi
      </button>
    </div>
  );
}

function WireframeLevelPill({ level }: { level: ReadinessLevel }) {
  return (
    <span
      className="inline-block px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wide"
      style={{
        borderColor: WF.border,
        background: WF_LEVEL[level],
        color: level === 'Skilled' ? WF.textOnActive : WF.text,
      }}
    >
      {level}
    </span>
  );
}

function DrillDownTable({ rows }: { rows: EmployeeRecord[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('finalScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
      else {
        setSortKey(key);
        setSortDir(['department', 'title'].includes(key) ? 'asc' : 'desc');
      }
    },
    [sortKey],
  );

  const sorted = useMemo(() => {
    const list = [...rows];
    list.sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      if (sortKey === 'level') {
        av = a.level ? LEVEL_ORDER[a.level] : -1;
        bv = b.level ? LEVEL_ORDER[b.level] : -1;
      } else if (sortKey === 'finalScore') {
        av = a.finalScore ?? -1;
        bv = b.finalScore ?? -1;
      } else if (sortKey === 'id') {
        av = a.id;
        bv = b.id;
      } else {
        av = a[sortKey];
        bv = b[sortKey];
      }
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return list;
  }, [rows, sortKey, sortDir]);

  const columns: { key: SortKey; label: string; align?: 'center' }[] = [
    { key: 'id', label: 'Employee' },
    { key: 'department', label: 'Dept' },
    { key: 'title', label: 'Role' },
    { key: 'finalScore', label: 'Score', align: 'center' },
    { key: 'level', label: 'Level' },
  ];

  if (rows.length === 0) {
    return (
      <p className="text-xs py-8 text-center" style={{ color: WF.muted }}>
        No employees match the current filter. Click a heat map cell or adjust scope.
      </p>
    );
  }

  return (
    <table className="w-full text-xs border-collapse">
      <thead className="sticky top-0 z-10" style={{ background: WF.surfaceMuted, borderBottom: `2px solid ${WF.border}` }}>
        <tr>
          {columns.map(col => (
            <th
              key={col.key}
              onClick={() => toggleSort(col.key)}
              className={`text-left px-3 py-2.5 font-medium uppercase tracking-wider cursor-pointer select-none last:border-r-0 ${col.align === 'center' ? 'text-center' : ''}`}
              style={{
                color: sortKey === col.key ? WF.text : WF.muted,
                borderRight: `1px solid ${WF.border}`,
              }}
            >
              <span className="inline-flex items-center gap-1">
                {col.label}
                {sortKey !== col.key && <ArrowUpDown size={9} className="opacity-40" />}
                {sortKey === col.key && sortDir === 'asc' && <ChevronUp size={10} />}
                {sortKey === col.key && sortDir === 'desc' && <ChevronDown size={10} />}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.map(e => (
          <tr key={e.id} style={{ borderBottom: `1px solid ${WF.border}`, background: WF.surface }}>
            <td className="px-3 py-2 font-medium" style={{ borderRight: `1px solid ${WF.border}` }}>
              {formatEmployeeId(e.id)}
            </td>
            <td className="px-3 py-2" style={{ color: WF.muted, borderRight: `1px solid ${WF.border}` }}>
              {e.department}
            </td>
            <td className="px-3 py-2" style={{ color: WF.muted, borderRight: `1px solid ${WF.border}` }}>
              {e.title}
            </td>
            <td className="px-3 py-2 text-center tabular-nums" style={{ borderRight: `1px solid ${WF.border}` }}>
              {hasCompletedAssessment(e) ? e.finalScore : '—'}
            </td>
            <td className="px-3 py-2">
              {hasCompletedAssessment(e) && e.level ? (
                <WireframeLevelPill level={e.level} />
              ) : (
                <span style={{ color: WF.muted }}>Not finished</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ExecIntelligenceView({ onAskObi }: { onAskObi: (text: string) => void }) {
  const [cannedView, setCannedView] = useState<CannedViewId>('my-org');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [heatFilter, setHeatFilter] = useState<{ department: string; level: ReadinessLevel } | null>(null);
  const [tableExpanded, setTableExpanded] = useState(false);

  const scopedEmployees = useMemo(
    () => scopeEmployees(cannedView, departmentFilter || null),
    [cannedView, departmentFilter],
  );

  const kpis = useMemo(() => computeExecKpis(scopedEmployees), [scopedEmployees]);
  const insightCards = useMemo(() => getExecInsightCards(scopedEmployees), [scopedEmployees]);
  const deptScores = useMemo(() => getDeptScoreRows(scopedEmployees), [scopedEmployees]);
  const levelDist = useMemo(() => getLevelDistribution(scopedEmployees), [scopedEmployees]);
  const heatCells = useMemo(() => getHeatMapCells(scopedEmployees), [scopedEmployees]);

  const tableRows = useMemo(() => {
    if (heatFilter) {
      return filterEmployeesByHeatCell(scopedEmployees, heatFilter.department, heatFilter.level);
    }
    return scopedEmployees;
  }, [scopedEmployees, heatFilter]);

  const departmentsInScope = useMemo(
    () => [...new Set(scopedEmployees.map(e => e.department))].sort(),
    [scopedEmployees],
  );

  const pieData = levelDist
    .filter(d => d.count > 0)
    .map(d => ({ name: d.level, value: d.count, color: WF_LEVEL[d.level] }));

  const riskStyle = DISRUPTION_BADGE[kpis.disruptionRisk];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-auto">
      {/* Scope header */}
      <div
        className="flex-none px-5 py-4 flex flex-wrap items-end gap-4"
        style={{ background: WF.surface, borderBottom: `1px solid ${WF.border}` }}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: WF.muted }}>
            Executive intelligence
          </p>
          <h2 className="text-base font-semibold mt-0.5" style={{ color: WF.text }}>AI readiness briefing</h2>
          <p className="text-[10px] mt-1" style={{ color: WF.muted }}>
            Updated {EXEC_LAST_UPDATED}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-wider font-medium" style={{ color: WF.muted }}>
              Department
            </span>
            <select
              value={departmentFilter}
              onChange={e => {
                setDepartmentFilter(e.target.value);
                setHeatFilter(null);
              }}
              className="text-xs px-2 py-1.5 min-w-[160px] rounded-sm"
              style={{ background: WF.surface, border: `1px solid ${WF.borderStrong}`, color: WF.text }}
            >
              <option value="">All departments</option>
              {ALL_DEPARTMENTS.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-1">
            {CANNED_VIEWS.map(view => (
              <button
                key={view.id}
                type="button"
                onClick={() => {
                  setCannedView(view.id);
                  setDepartmentFilter('');
                  setHeatFilter(null);
                }}
                className="px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wider rounded-sm"
                style={{
                  background: cannedView === view.id ? WF.accentSoft : WF.surface,
                  color: cannedView === view.id ? WF.text : WF.muted,
                  border: `1px solid ${cannedView === view.id ? WF.borderStrong : WF.border}`,
                }}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div
        className="flex-none px-5 py-4 grid grid-cols-2 lg:grid-cols-4 gap-3"
        style={{ background: WF.bg, borderBottom: `1px solid ${WF.border}` }}
      >
        <KpiCard
          label="Org readiness"
          value={<p className="text-2xl font-semibold tabular-nums" style={{ color: WF.text }}>{kpis.orgReadiness}</p>}
          detail={`+${kpis.readinessDeltaQoq} vs last quarter`}
        />
        <KpiCard
          label="Critical gaps"
          value={<p className="text-2xl font-semibold tabular-nums" style={{ color: '#991B1B' }}>{kpis.criticalGaps}</p>}
          detail="High-exposure, low-readiness employees"
          alert={kpis.criticalGaps >= 5}
        />
        <KpiCard
          label="Skilled employees"
          value={<p className="text-2xl font-semibold tabular-nums" style={{ color: WF.text }}>{kpis.skilledCount}</p>}
          detail={`+${kpis.skilledTrendQoq}% quarter over quarter`}
        />
        <KpiCard
          label="Disruption risk"
          value={
            <span
              className="inline-block text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-sm"
              style={{ background: riskStyle.bg, color: riskStyle.text }}
            >
              {kpis.disruptionRisk}
            </span>
          }
          detail="Composite exposure vs readiness"
        />
      </div>

      {/* Intelligence feed */}
      <SectionHeader title="Intelligence feed" subtitle="Obi-generated insights for your scope" />
      <div
        className="flex-none px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-3"
        style={{ background: WF.bg, borderBottom: `1px solid ${WF.border}` }}
      >
        {insightCards.map(card => (
          <InsightCard key={card.id} card={card} onAskObi={onAskObi} />
        ))}
      </div>

      {/* Charts */}
      <SectionHeader title="Where people are & what to close" />
      <div
        className="flex-none px-5 py-4 grid grid-cols-1 lg:grid-cols-2 gap-6"
        style={{ background: WF.bg, borderBottom: `1px solid ${WF.border}` }}
      >
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider mb-3" style={{ color: WF.muted }}>
            Readiness by department
          </p>
          <div className="h-[220px] p-2 rounded-sm" style={wfCardStyle}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptScores} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} stroke={WF.border} />
                <YAxis
                  type="category"
                  dataKey="department"
                  width={108}
                  tick={{ fontSize: 9 }}
                  stroke={WF.border}
                />
                <Tooltip
                  contentStyle={{ background: WF.bg, border: `1px solid ${WF.border}`, borderRadius: 0, fontSize: 11 }}
                  formatter={(v: number) => [v, 'Avg score']}
                />
                <Bar dataKey="avgScore" radius={0}>
                  {deptScores.map(row => (
                    <Cell key={row.department} fill={BAR_FILL[row.color]} stroke={WF.border} strokeWidth={1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider mb-3" style={{ color: WF.muted }}>
            Skill level mix
          </p>
          <div className="h-[160px] p-2 flex items-center justify-center rounded-sm" style={wfCardStyle}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={1}
                    stroke={WF.border}
                    strokeWidth={1}
                  >
                    {pieData.map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: WF.bg, border: `1px solid ${WF.border}`, borderRadius: 0, fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs" style={{ color: WF.muted }}>
                No assessed employees in scope
              </span>
            )}
          </div>
          <p className="text-[9px] uppercase tracking-wider mt-2 mb-1" style={{ color: WF.muted }}>
            Skilled % — quarter trend
          </p>
          <div className="h-[52px] px-2 rounded-sm" style={{ ...wfCardStyle, background: WF.surface }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={QUARTER_SKILLED_TREND} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="quarter" tick={{ fontSize: 9 }} stroke={WF.muted} />
                <Tooltip
                  contentStyle={{ background: WF.surface, border: `1px solid ${WF.border}`, borderRadius: 4, fontSize: 10 }}
                  formatter={(v: number) => [`${v}%`, 'Skilled share']}
                />
                <Line
                  type="monotone"
                  dataKey="skilledPct"
                  stroke={WF.accent}
                  strokeWidth={2}
                  dot={{ r: 3, fill: WF.accent, stroke: WF.surface }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Heat map */}
      <SectionHeader
        title="Department × skill level"
        subtitle="Click a cell to filter the drill-down table"
      />
      <div
        className="flex-none px-5 py-4 overflow-x-auto"
        style={{ background: WF.bg, borderBottom: `1px solid ${WF.border}` }}
      >
        <div className="inline-block min-w-full">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `120px repeat(4, minmax(72px, 1fr))`,
            }}
          >
            <div />
            {(['Beginner', 'Learner', 'Familiar', 'Skilled'] as ReadinessLevel[]).map(level => (
              <div
                key={level}
                className="text-[9px] font-bold uppercase tracking-wider text-center py-1"
                style={{ color: WF.muted }}
              >
                {level}
              </div>
            ))}

            {departmentsInScope.map(dept => (
              <Fragment key={dept}>
                <div
                  className="text-[10px] font-medium py-2 pr-2 flex items-center"
                  style={{ color: WF.muted }}
                >
                  {dept}
                </div>
                {(['Beginner', 'Learner', 'Familiar', 'Skilled'] as ReadinessLevel[]).map(level => {
                  const cell = heatCells.find(c => c.department === dept && c.level === level);
                  const count = cell?.count ?? 0;
                  const intensity = cell?.intensity ?? 0;
                  const isActive =
                    heatFilter?.department === dept && heatFilter?.level === level;

                  return (
                    <button
                      key={`${dept}-${level}`}
                      type="button"
                      onClick={() =>
                        setHeatFilter(prev =>
                          prev?.department === dept && prev?.level === level
                            ? null
                            : { department: dept, level },
                        )
                      }
                      className="py-3 text-xs font-semibold tabular-nums transition-all rounded-sm"
                      style={{
                        background: count
                          ? `rgba(44, 44, 46, ${0.06 + intensity * 0.55})`
                          : WF.surfaceMuted,
                        color: intensity > 0.5 ? WF.text : WF.textSecondary,
                        border: `1px solid ${isActive ? WF.fillActive : WF.border}`,
                        boxShadow: isActive ? WF.shadowMd : undefined,
                      }}
                    >
                      {count || '·'}
                    </button>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
        {heatFilter && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px]" style={{ color: WF.muted }}>
              Filtered: {heatFilter.department} · {heatFilter.level}
            </span>
            <button
              type="button"
              onClick={() => setHeatFilter(null)}
              className="text-[10px] font-medium px-2 py-0.5 rounded-sm"
              style={{ background: WF.surfaceMuted, color: WF.textSecondary, border: `1px solid ${WF.border}` }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Collapsed table */}
      <div className="flex-none" style={{ borderBottom: `1px solid ${WF.border}` }}>
        <button
          type="button"
          onClick={() => setTableExpanded(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-left"
          style={{ background: WF.surfaceMuted }}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: WF.muted }}>
              Full employee detail
            </p>
            {!tableExpanded && (
              <p className="text-xs mt-0.5" style={{ color: WF.muted }}>
                {tableRows.length} records · click to expand sortable table
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
        <div
          className="flex-none max-h-[360px] overflow-auto"
          style={{ borderBottom: `1px solid ${WF.border}`, background: WF.surface }}
        >
          <DrillDownTable rows={tableRows} />
        </div>
      )}
    </div>
  );
}
