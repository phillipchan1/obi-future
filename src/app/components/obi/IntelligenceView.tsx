import { useState, useMemo, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Search,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  X,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  EMPLOYEES,
  formatEmployeeId,
  LEADER_STATS,
  DIMENSION_META,
  hasCompletedAssessment,
  type ReadinessLevel,
  type EmployeeRecord,
} from '../../../data/dashboard';
import { WF, WF_LEVEL, WF_CSS_VARS, wfTabActiveStyle, wfTabInactiveStyle } from './wireframe-theme';
import { FilterChipRow, MultiSelectFilter, type FilterOption } from './shared/MultiSelectFilter';
import { ColumnPicker } from './shared/ColumnPicker';
import { OrgTreeView } from './OrgTreeView';
import { ExecIntelligenceView } from './ExecIntelligenceView';
import { getObiResponse } from '../../../data/obi-intelligence';
import './wireframe.css';

type IntelligenceViewMode = 'table' | 'org-tree' | 'exec-brief';

const TAB_PATHS: Record<IntelligenceViewMode, string> = {
  'org-tree': '/intelligence/org-tree',
  'exec-brief': '/intelligence/exec-brief',
  table: '/intelligence/table',
};

function tabFromParam(tab: string | undefined): IntelligenceViewMode {
  if (tab === 'exec-brief' || tab === 'table' || tab === 'org-tree') return tab;
  return 'org-tree';
}

// ─── Sorts & helpers ───────────────────────────────────────────────────────────

type SortKey =
  | 'id' | 'department' | 'title' | 'finalScore'
  | 'level' | 'roleDisruptionPct'
  | 'copilotUsage' | 'scoreConfidence';
type SortDir = 'asc' | 'desc';

type ColumnId = 'id' | 'department' | 'title' | 'finalScore' | 'level' | 'roleDisruptionPct';
type AggregateKind = 'average' | 'none';

type TableColumn = {
  id: ColumnId;
  label: string;
  sortKey: SortKey;
  align?: 'center';
  defaultVisible: boolean;
  preview?: boolean;
  aggregate: AggregateKind;
};

const TABLE_COLUMNS: TableColumn[] = [
  { id: 'id', label: 'Employee', sortKey: 'id', defaultVisible: true, aggregate: 'none' },
  { id: 'department', label: 'Dept', sortKey: 'department', defaultVisible: true, aggregate: 'none' },
  { id: 'title', label: 'Role', sortKey: 'title', defaultVisible: true, aggregate: 'none' },
  { id: 'finalScore', label: 'Score', sortKey: 'finalScore', align: 'center', defaultVisible: true, aggregate: 'average' },
  { id: 'level', label: 'Level', sortKey: 'level', defaultVisible: true, aggregate: 'none' },
  {
    id: 'roleDisruptionPct',
    label: 'Role Disruption',
    sortKey: 'roleDisruptionPct',
    align: 'center',
    defaultVisible: false,
    preview: true,
    aggregate: 'average',
  },
];

const DEFAULT_VISIBLE_COLUMNS = new Set(
  TABLE_COLUMNS.filter(c => c.defaultVisible).map(c => c.id),
);

const LEVEL_ORDER: Record<ReadinessLevel, number> = { Beginner: 0, Learner: 1, Familiar: 2, Skilled: 3 };

const DEPT_OPTIONS = [...new Set(EMPLOYEES.map(e => e.department))].sort();
const ROLE_OPTIONS = [...new Set(EMPLOYEES.map(e => e.title))].sort();
const LEVEL_OPTIONS: ReadinessLevel[] = ['Beginner', 'Learner', 'Familiar', 'Skilled'];

function countBy<T extends string>(values: T[]): Map<T, number> {
  const counts = new Map<T, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return counts;
}

const DEPT_COUNTS = countBy(EMPLOYEES.map(e => e.department));
const ROLE_COUNTS = countBy(EMPLOYEES.map(e => e.title));
const LEVEL_COUNTS = countBy(EMPLOYEES.map(e => e.level));

function toOptions(values: string[], counts: Map<string, number>): FilterOption[] {
  return values.map(value => ({ value, label: value, count: counts.get(value) }));
}

function getValue(e: EmployeeRecord, key: SortKey): number | string {
  if (key === 'level') return e.level ? LEVEL_ORDER[e.level] : -1;
  if (key === 'finalScore') return e.finalScore ?? -1;
  return e[key as keyof EmployeeRecord] as number | string;
}

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

function NotFinishedCell() {
  return (
    <span className="text-[10px] font-medium tabular-nums italic" style={{ color: WF.muted }}>
      Not finished
    </span>
  );
}

function renderCell(col: TableColumn, e: EmployeeRecord): ReactNode {
  switch (col.id) {
    case 'id':
      return <span className="font-medium whitespace-nowrap">{formatEmployeeId(e.id)}</span>;
    case 'department':
      return <span style={{ color: WF.muted }}>{e.department}</span>;
    case 'title':
      return <span style={{ color: WF.muted }}>{e.title}</span>;
    case 'finalScore':
      return hasCompletedAssessment(e)
        ? <span className="font-medium tabular-nums">{e.finalScore}</span>
        : <NotFinishedCell />;
    case 'level':
      return hasCompletedAssessment(e) && e.level
        ? <WireframeLevelPill level={e.level} />
        : <NotFinishedCell />;
    case 'roleDisruptionPct':
      return <span className="font-medium tabular-nums">{e.roleDisruptionPct}</span>;
    default:
      return null;
  }
}

function renderFooterCell(col: TableColumn, rows: EmployeeRecord[], isFirstColumn: boolean): ReactNode {
  if (rows.length === 0) return '\u2014';
  if (isFirstColumn) {
    return (
      <span>
        <span className="font-semibold">Average</span>
        <span className="block text-[10px] font-normal mt-0.5 tabular-nums" style={{ color: WF.muted }}>
          {rows.length} row{rows.length === 1 ? '' : 's'}
        </span>
      </span>
    );
  }
  if (col.aggregate === 'average') {
    const assessed = rows.filter(hasCompletedAssessment);
    if (assessed.length === 0) return '\u2014';
    if (col.id === 'finalScore') {
      const avg = Math.round((assessed.reduce((s, e) => s + (e.finalScore ?? 0), 0) / assessed.length) * 10) / 10;
      return <span className="font-semibold tabular-nums">{avg}</span>;
    }
    if (col.id === 'roleDisruptionPct') {
      const avg = Math.round((assessed.reduce((s, e) => s + e.roleDisruptionPct, 0) / assessed.length) * 10) / 10;
      return <span className="font-semibold tabular-nums">{avg}</span>;
    }
  }
  return null;
}

function dimBarFill(val: number, n: number): string {
  if (n > val) return WF.bg;
  if (val >= 4) return WF.text;
  if (val >= 3) return '#666666';
  if (val >= 2) return '#AAAAAA';
  return WF.borderLight;
}

function confidenceLabel(c: number): string {
  if (c >= 0.8) return 'High';
  if (c >= 0.6) return 'Medium';
  return 'Low';
}

// ─── Chat preseeded ────────────────────────────────────────────────────────────

type ChatItem = { type: 'user'; text: string } | { type: 'obi'; query: string };

const EXEC_NARRATIVE: ChatItem[] = [
  { type: 'user', text: 'Give me the headline. Where are we on AI readiness?' },
  { type: 'obi', query: '__exec_1_headline__' },
  { type: 'user', text: 'What should I be worried about?' },
  { type: 'obi', query: '__exec_2_worried__' },
  { type: 'user', text: 'Is that a training problem or a people problem?' },
  { type: 'obi', query: '__exec_3_diagnosis__' },
  { type: 'user', text: 'What do I tell my VP in our QBR next week?' },
  { type: 'obi', query: '__exec_4_qbr__' },
  { type: 'user', text: 'If I could only do one thing this week, what is it?' },
  { type: 'obi', query: '__exec_5_one_thing__' },
];

const EXEC_RESPONSES: Record<string, ReturnType<typeof getObiResponse>> = {
  __exec_1_headline__: {
    summary: `${LEADER_STATS.uniqueCompletions} employees assessed, average readiness ${LEADER_STATS.avgScore}. You\u2019re ${LEADER_STATS.topQuartileBenchmark - LEADER_STATS.avgScore} points behind top-quartile utility peers \u2014 but closing faster than the sector average.`,
    internal: [
      `+${LEADER_STATS.scoreGainInRollout} pts in ${LEADER_STATS.rolloutDay} days \u2014 stronger than typical cohort ramp`,
      `54% already at Skilled level \u2014 your top half is in good shape`,
      `At current trajectory, benchmark parity in ~11 weeks`,
    ],
    research: {
      text: 'Top-quartile utility orgs maintain 79+ readiness. You\u2019re tracking toward that.',
      citation: 'Microsoft Work Trend Index 2025',
    },
    action: 'The trajectory is your story. The risk is in the bottom quartile.',
    followUps: ['What should I be worried about?', 'How do we compare to the utility sector?'],
  },
  __exec_2_worried__: {
    summary: 'Two things. First: 6 employees in your most AI-disrupted roles haven\u2019t moved since Day 1. Second: Workflow Impact is the org-wide bottleneck \u2014 people are learning concepts but not changing how they work.',
    internal: [
      'Discovery & Research roles are 92% AI-disrupted and sitting at Beginner level',
      `${LEADER_STATS.nonReengagedCount} employees total haven\u2019t re-engaged since their first assessment`,
      'Workflow Impact is the lowest-scoring dimension across the org \u2014 the gap between knowing and doing',
    ],
    research: {
      text: 'McKinsey 2025: roles above 85% disruption without Familiar+ readiness face 3x higher transformation risk within 18 months.',
      citation: 'McKinsey Global Institute, 2025',
    },
    action: 'The 6 high-exposure employees are urgent. The Workflow Impact bottleneck is structural \u2014 it won\u2019t fix itself with more courses.',
    followUps: ['Is that a training problem or a people problem?', 'Who are these 6 employees?'],
  },
  __exec_3_diagnosis__: {
    summary: 'Neither. It\u2019s an activation problem. Your people scored fine on Prompting and Mindset \u2014 they understand AI conceptually. But Workflow Impact is low because nobody is using AI in their actual day-to-day yet. The knowledge is there, the behavior change isn\u2019t.',
    internal: [
      'Prompting Skill and Mindset avg 3.4/5 \u2014 above threshold',
      'Workflow Impact avg 2.1/5 \u2014 well below. This is the drag on the overall score.',
      'Copilot usage is 31 chats/quarter median vs 70+ for top performers \u2014 confirms the doing gap',
    ],
    research: {
      text: 'Microsoft Work Trend Index: top Copilot users see 2x productivity within 6 months. The gap between knowing and doing compounds.',
      citation: 'Microsoft Work Trend Index, 2025',
    },
    action: 'Don\u2019t buy more training. Create structured reasons for people to use AI in real work this week. A Copilot challenge, a peer demo, a workflow sprint.',
    followUps: ['What do I tell my VP?', 'Who should I activate as peer coaches?'],
  },
  __exec_4_qbr__: {
    summary: 'Lead with three numbers: 71.4 avg readiness (up 8 pts in 5 days), 54% at Skilled, 11 weeks to benchmark parity. Then name the risk and the plan.',
    internal: [
      'Frame: "We\u2019re above sector trajectory and closing the gap \u2014 here\u2019s how we hold it"',
      'Risk: "6 employees in our highest-disrupted roles need targeted intervention this month"',
      'Plan: "We\u2019re activating 3 peer coaches and shifting focus from knowledge to workflow adoption"',
    ],
    research: {
      text: 'WEF 2025: AI-native teams are shipping 2x faster. Frame this as competitive positioning, not compliance.',
      citation: 'WEF Future of Jobs, 2025',
    },
    action: 'Don\u2019t present this as a training update. Present it as a strategic asset you\u2019re building. The numbers back it up.',
    followUps: ['Generate a VP readiness brief', 'If I could only do one thing this week, what is it?'],
    showReport: true,
  },
  __exec_5_one_thing__: {
    summary: 'Activate your 3 peer coaches. It\u2019s the single highest-leverage move available to you right now \u2014 it costs nothing, addresses the Workflow Impact bottleneck directly, and creates visible momentum before your QBR.',
    internal: [
      '3 Skilled employees map directly to your lowest-readiness clusters',
      'Peer-led skill transfer outperforms instructor-led by 40% (HBR 2024)',
      'Public recognition + light structure \u2014 78% acceptance rate vs 31% for cold asks',
    ],
    research: {
      text: 'Peer coaching closes the knowing-doing gap because it\u2019s workflow-embedded, not classroom-based.',
      citation: 'Harvard Business Review, 2024',
    },
    action: 'Send 3 emails today. Frame it as recognition, not a request. "You\u2019re one of three people who\u2019s figured this out \u2014 would you show others how?"',
    followUps: ['Draft the peer coach invitation for me', 'What\u2019s the second thing I should do?'],
  },
};

function getExecResponse(query: string): ReturnType<typeof getObiResponse> {
  return EXEC_RESPONSES[query] ?? getObiResponse(query, 'leader');
}

function WireframeChatMessage({
  item,
  onFollowUp,
}: {
  item: ChatItem;
  onFollowUp: (text: string) => void;
}) {
  if (item.type === 'user') {
    return (
      <div className="border border-black p-3 text-xs" style={{ background: WF.bg }}>
        <span className="font-bold block mb-1 uppercase tracking-wide text-[10px]">[ User ]</span>
        {item.text}
      </div>
    );
  }
  const response = getExecResponse(item.query);
  return (
    <div
      className="border-2 border-dashed p-3 text-xs rounded-sm"
      style={{ background: WF.surfaceMuted, borderColor: WF.borderStrong }}
    >
      <span className="font-bold block mb-1 uppercase tracking-wide text-[10px]">[ Obi ]</span>
      <p className="leading-relaxed">{response.summary}</p>
      {response.followUps && response.followUps.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {response.followUps.slice(0, 2).map(fu => (
            <button
              key={fu}
              type="button"
              onClick={() => onFollowUp(fu)}
              className="px-2 py-1 border border-black text-[10px] text-left"
              style={{ background: WF.bg }}
            >
              → {fu}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Expanded row detail ───────────────────────────────────────────────────────

function ExpandedDetail({ e, colSpan }: { e: EmployeeRecord; colSpan: number }) {
  if (!hasCompletedAssessment(e)) {
    return (
      <tr style={{ backgroundColor: WF.surface }}>
        <td colSpan={colSpan} className="px-6 py-4 border-t border-black">
          <p className="text-xs" style={{ color: WF.muted }}>
            Opened Obi but hasn&apos;t completed the readiness assessment yet.
          </p>
          <div className="flex gap-6 mt-3 text-xs">
            <div>
              <span style={{ color: WF.muted }}>Last active </span>
              <span className="font-medium">{e.lastActivityAt}</span>
            </div>
            <div>
              <span style={{ color: WF.muted }}>Role disruption </span>
              <span className="font-medium">{e.roleDisruptionPct}</span>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr style={{ backgroundColor: WF.surface }}>
      <td colSpan={colSpan} className="px-6 py-4 border-t border-black">
        <div className="grid grid-cols-3 gap-6 max-w-4xl">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-3 border-b border-black pb-1" style={{ color: WF.muted }}>
              Skill Dimensions
            </p>
            <div className="space-y-2">
              {DIMENSION_META.map(dim => {
                const val = e.dimensions[dim.key];
                const isBottleneck = e.bottleneck === dim.label;
                return (
                  <div key={dim.key} className="flex items-center gap-2">
                    <span
                      className="text-[10px] w-[110px] flex-shrink-0 truncate"
                      style={{ color: WF.text, fontWeight: isBottleneck ? 700 : 400 }}
                    >
                      {dim.label}
                      {isBottleneck && ' *'}
                    </span>
                    <div className="flex gap-0.5 flex-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <div
                          key={n}
                          className="h-2 flex-1 border border-black"
                          style={{ backgroundColor: dimBarFill(val, n) }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] w-4 text-right font-mono" style={{ color: WF.muted }}>
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-3 border-b border-black pb-1" style={{ color: WF.muted }}>
              Progress
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-dotted border-black/30 pb-1">
                <span style={{ color: WF.muted }}>Level Gate</span>
                <span className="font-medium">Gate {e.currentLevelGate} of 3</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-black/30 pb-1">
                <span style={{ color: WF.muted }}>Courses Done</span>
                <span className="font-medium">{e.coursesCompletedCount}</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-black/30 pb-1">
                <span style={{ color: WF.muted }}>Copilot Usage</span>
                <span className="font-medium">{e.copilotUsage} chats/qtr</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: WF.muted }}>Score Change</span>
                <span className="font-medium">
                  {e.firstScore} → {e.finalScore} ({e.finalScore != null && e.firstScore != null && e.finalScore - e.firstScore > 0 ? '+' : ''}{e.finalScore != null && e.firstScore != null ? e.finalScore - e.firstScore : '—'})
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-3 border-b border-black pb-1" style={{ color: WF.muted }}>
              Details
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-dotted border-black/30 pb-1">
                <span style={{ color: WF.muted }}>Tenure</span>
                <span className="font-medium">{e.tenureBand}</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-black/30 pb-1">
                <span style={{ color: WF.muted }}>Confidence</span>
                <span className="font-medium">{confidenceLabel(e.scoreConfidence)}</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-black/30 pb-1">
                <span style={{ color: WF.muted }}>Assessed</span>
                <span className="font-medium">{e.assessmentCompletedAt}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: WF.muted }}>Last Active</span>
                <span className="font-medium">{e.lastActivityAt}</span>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Main view ─────────────────────────────────────────────────────────────────

export function IntelligenceView() {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();
  const viewMode = tabFromParam(tab);

  const setViewMode = useCallback(
    (mode: IntelligenceViewMode) => {
      navigate(TAB_PATHS[mode]);
    },
    [navigate],
  );

  useEffect(() => {
    if (tab && tab !== viewMode) {
      navigate(TAB_PATHS['org-tree'], { replace: true });
    }
  }, [tab, viewMode, navigate]);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('finalScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [deptFilters, setDeptFilters] = useState<string[]>([]);
  const [roleFilters, setRoleFilters] = useState<string[]>([]);
  const [levelFilters, setLevelFilters] = useState<ReadinessLevel[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [visibleColumnIds, setVisibleColumnIds] = useState<Set<ColumnId>>(
    () => new Set(DEFAULT_VISIBLE_COLUMNS),
  );
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatItem[]>(EXEC_NARRATIVE);
  const [chatInput, setChatInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        const textKeys: SortKey[] = ['department', 'title'];
        setSortDir(textKeys.includes(key) ? 'asc' : 'desc');
      }
    },
    [sortKey],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return EMPLOYEES.filter(e => {
      if (deptFilters.length && !deptFilters.includes(e.department)) return false;
      if (roleFilters.length && !roleFilters.includes(e.title)) return false;
      if (levelFilters.length && !levelFilters.includes(e.level)) return false;
      if (
        q &&
        !formatEmployeeId(e.id).toLowerCase().includes(q) &&
        !e.department.toLowerCase().includes(q) &&
        !e.title.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [search, deptFilters, roleFilters, levelFilters]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const av = getValue(a, sortKey);
      const bv = getValue(b, sortKey);
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, { type: 'user', text: trimmed }, { type: 'obi', query: trimmed }]);
    setChatInput('');
  }, []);

  const handleAskObi = useCallback(
    (text: string) => {
      setChatOpen(true);
      sendMessage(text);
    },
    [sendMessage],
  );

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const exportCsv = () => {
    const headers = [
      'Employee', 'Department', 'Title', 'Tenure', 'Score', 'Level',
      'Copilot', 'Confidence',
      'Prompting', 'Workflow', 'Scaling', 'Mindset', 'Usage',
      'Courses', 'Gate', 'Assessed', 'Last Active',
    ];
    const rows = sorted.map(e => [
      formatEmployeeId(e.id), e.department, e.title, e.tenureBand,
      hasCompletedAssessment(e) ? e.finalScore : 'Not finished',
      hasCompletedAssessment(e) ? e.level : 'Not finished',
      e.copilotUsage, e.scoreConfidence,
      e.dimensions.promptingSkill, e.dimensions.workflowImpact,
      e.dimensions.scalingEnablement, e.dimensions.mindsetComfort,
      e.dimensions.usageFrequency,
      e.coursesCompletedCount, e.currentLevelGate,
      e.assessmentCompletedAt, e.lastActivityAt,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'super-leader-dashboard-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllFilters = useCallback(() => {
    setDeptFilters([]);
    setRoleFilters([]);
    setLevelFilters([]);
    setSearch('');
  }, []);

  const filterChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    for (const d of deptFilters) {
      chips.push({
        key: `dept-${d}`,
        label: `Dept · ${d}`,
        onRemove: () => setDeptFilters(prev => prev.filter(v => v !== d)),
      });
    }
    for (const r of roleFilters) {
      chips.push({
        key: `role-${r}`,
        label: `Role · ${r}`,
        onRemove: () => setRoleFilters(prev => prev.filter(v => v !== r)),
      });
    }
    for (const l of levelFilters) {
      chips.push({
        key: `level-${l}`,
        label: `Level · ${l}`,
        onRemove: () => setLevelFilters(prev => prev.filter(v => v !== l)),
      });
    }
    return chips;
  }, [deptFilters, roleFilters, levelFilters]);

  const assessedFiltered = useMemo(
    () => filtered.filter(hasCompletedAssessment),
    [filtered],
  );

  const avgScore = assessedFiltered.length
    ? Math.round((assessedFiltered.reduce((s, e) => s + (e.finalScore ?? 0), 0) / assessedFiltered.length) * 10) / 10
    : 0;

  const levelDistribution = useMemo(() => {
    const counts: Record<ReadinessLevel, number> = {
      Beginner: 0,
      Learner: 0,
      Familiar: 0,
      Skilled: 0,
    };
    for (const e of assessedFiltered) {
      if (e.level) counts[e.level]++;
    }
    return (['Beginner', 'Learner', 'Familiar', 'Skilled'] as ReadinessLevel[]).map(level => ({
      level,
      count: counts[level],
      color: WF_LEVEL[level],
    }));
  }, [assessedFiltered]);

  const pieData = useMemo(
    () => levelDistribution.filter(d => d.count > 0).map(d => ({ name: d.level, value: d.count, color: d.color })),
    [levelDistribution],
  );

  const visibleColumns = useMemo(
    () => TABLE_COLUMNS.filter(c => visibleColumnIds.has(c.id)),
    [visibleColumnIds],
  );

  const toggleColumn = useCallback((id: string) => {
    setVisibleColumnIds(prev => {
      const next = new Set(prev);
      if (next.has(id as ColumnId)) {
        if (next.size <= 1) return prev;
        next.delete(id as ColumnId);
      } else {
        next.add(id as ColumnId);
      }
      return next;
    });
  }, []);

  return (
    <div
      className="intelligence-wireframe fixed inset-0 flex"
      style={{ fontFamily: WF.font, background: WF.bg, color: WF.text, ...WF_CSS_VARS }}
    >
      <div className="flex-1 flex flex-col min-w-0" style={{ borderRight: `1px solid ${WF.border}` }}>
        <header
          className="flex-none px-6 py-4 flex items-center justify-between gap-4"
          style={{ background: WF.surface, borderBottom: `1px solid ${WF.border}` }}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-semibold" style={{ color: WF.text }}>Super Leader Dashboard</h1>
            </div>
            <p className="text-xs mt-1" style={{ color: WF.muted }}>
              {LEADER_STATS.uniqueCompletions} assessed · {LEADER_STATS.jobTitleCount} roles
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
              style={{ background: WF.surface, border: `1px solid ${WF.borderStrong}`, color: WF.textSecondary }}
            >
              <Download size={12} />
              Export
            </button>
            <button
              type="button"
              onClick={() => setChatOpen(o => !o)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
              style={{
                background: chatOpen ? WF.fillActive : WF.accent,
                color: WF.textOnActive,
                border: `1px solid ${chatOpen ? WF.fillActive : WF.accent}`,
              }}
            >
              <MessageSquare size={12} />
              Ask Obi
            </button>
          </div>
        </header>

        <div
          className="flex-none px-6 py-2 flex gap-1"
          style={{ background: WF.bg, borderBottom: `1px solid ${WF.border}` }}
        >
          {([
            { id: 'exec-brief' as const, label: 'Executive Brief', hint: 'Spoonfed intelligence' },
            { id: 'org-tree' as const, label: 'Org Tree', hint: 'Hierarchy & pocket selection' },
            { id: 'table' as const, label: 'Data Table', hint: 'Filters & sortable records' },
          ]).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setViewMode(tab.id)}
              className="px-3 py-2 text-left min-w-[120px] border-b-2"
              style={viewMode === tab.id ? wfTabActiveStyle : wfTabInactiveStyle}
            >
              <span
                className="block text-xs font-semibold"
                style={{ color: viewMode === tab.id ? WF.text : WF.muted }}
              >
                {tab.label}
              </span>
              <span
                className="block text-[9px] mt-0.5 uppercase tracking-wider"
                style={{ color: viewMode === tab.id ? WF.textSecondary : WF.muted }}
              >
                {tab.hint}
              </span>
            </button>
          ))}
        </div>

        {viewMode === 'exec-brief' ? (
          <ExecIntelligenceView onAskObi={handleAskObi} />
        ) : viewMode === 'org-tree' ? (
          <OrgTreeView />
        ) : (
          <>
        <div className="flex-none px-5 py-3 flex flex-wrap items-center gap-2 border-b border-black">
          <div className="flex items-center gap-1.5 mr-1">
            <SlidersHorizontal size={12} style={{ color: WF.muted }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: WF.muted }}>
              Filters
            </span>
          </div>
          <MultiSelectFilter wireframe label="Department" options={toOptions(DEPT_OPTIONS, DEPT_COUNTS)} selected={deptFilters} onChange={setDeptFilters} />
          <MultiSelectFilter wireframe label="Role" options={toOptions(ROLE_OPTIONS, ROLE_COUNTS)} selected={roleFilters} onChange={setRoleFilters} searchable searchPlaceholder="Search roles..." />
          <MultiSelectFilter wireframe label="Level" options={toOptions(LEVEL_OPTIONS, LEVEL_COUNTS)} selected={levelFilters} onChange={v => setLevelFilters(v as ReadinessLevel[])} />
          <span className="ml-auto text-[10px] tabular-nums" style={{ color: WF.muted }}>
            {sorted.length} of {EMPLOYEES.length}
          </span>
        </div>

        <FilterChipRow wireframe chips={filterChips} onClearAll={clearAllFilters} />

        <div className="flex-none grid grid-cols-3 border-b border-black">
          <div className="px-5 py-4 border-r border-black">
            <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: WF.muted }}>Readiness Average</p>
            <p className="text-2xl font-bold mt-1">{assessedFiltered.length ? avgScore : '\u2014'}</p>
            <p className="text-[10px] mt-1" style={{ color: WF.muted }}>
              {assessedFiltered.length ? `Across ${assessedFiltered.length} assessed` : filtered.length ? 'No assessments in view' : 'No matches'}
            </p>
          </div>
          <div className="px-5 py-4 border-r border-black">
            <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: WF.muted }}>Completions</p>
            <p className="text-2xl font-bold mt-1">{assessedFiltered.length}</p>
          </div>
          <div className="px-5 py-3">
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: WF.muted }}>Level Distribution</p>
            <div className="flex items-center gap-3">
              <div className="w-[88px] h-[88px] flex-shrink-0">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={22} outerRadius={40} paddingAngle={1} stroke={WF.border} strokeWidth={1}>
                        {pieData.map(entry => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: WF.bg, border: `1px solid ${WF.border}`, borderRadius: 0, fontSize: 11 }}
                        itemStyle={{ color: WF.text }}
                        formatter={(value: number, name: string) => [
                          `${value} (${assessedFiltered.length ? Math.round((value / assessedFiltered.length) * 100) : 0}%)`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full border border-dashed border-black flex items-center justify-center text-[9px]" style={{ color: WF.muted }}>
                    No data
                  </div>
                )}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1 min-w-0">
                {levelDistribution.map(({ level, count, color }) => (
                  <div key={level} className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[10px] truncate" style={{ color: WF.muted }}>{level}</span>
                    <span className="text-[10px] font-semibold ml-auto tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-none px-5 py-2.5 flex items-center gap-2 border-b border-black">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: WF.muted }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employee, dept, role..."
              className="w-full pl-8 pr-3 py-1.5 text-xs outline-none border border-black"
              style={{ background: WF.bg, color: WF.text }}
            />
          </div>
          <ColumnPicker wireframe columns={TABLE_COLUMNS} visible={visibleColumnIds} onToggle={toggleColumn} />
        </div>

        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10 border-b-2 border-black" style={{ background: WF.fill }}>
              <tr>
                <th className="w-6 px-2 border-r border-black" />
                {visibleColumns.map(col => (
                  <th
                    key={col.id}
                    onClick={() => toggleSort(col.sortKey)}
                    className={`text-left px-3 py-2.5 font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer select-none border-r border-black last:border-r-0 ${col.align === 'center' ? 'text-center' : ''}`}
                    style={{ color: sortKey === col.sortKey ? WF.text : WF.muted, background: sortKey === col.sortKey ? WF.bg : WF.fill }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.preview && (
                        <span className="text-[7px] font-bold uppercase px-1 py-0.5 border border-black" style={{ background: WF.surface }}>
                          Preview
                        </span>
                      )}
                      {sortKey !== col.sortKey && <ArrowUpDown size={9} className="opacity-40" />}
                      {sortKey === col.sortKey && sortDir === 'asc' && <ChevronUp size={10} />}
                      {sortKey === col.sortKey && sortDir === 'desc' && <ChevronDown size={10} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(e => {
                const isHighRisk = hasCompletedAssessment(e) && e.gapScore > 25 && (e.level === 'Beginner' || e.level === 'Learner');
                const isExpanded = expandedRow === e.id;
                return (
                  <>
                    <tr
                      key={e.id}
                      role="button"
                      tabIndex={0}
                      className="border-b border-black cursor-pointer"
                      style={{
                        backgroundColor: isHighRisk ? WF.hatch : isExpanded ? WF.surface : WF.bg,
                        outline: isHighRisk ? '2px dashed #000' : undefined,
                        outlineOffset: '-2px',
                      }}
                      onClick={() => setExpandedRow(isExpanded ? null : e.id)}
                      onKeyDown={ev => {
                        if (ev.key === 'Enter' || ev.key === ' ') {
                          ev.preventDefault();
                          setExpandedRow(isExpanded ? null : e.id);
                        }
                      }}
                    >
                      <td className="px-2 py-2 border-r border-black">
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} style={{ opacity: 0.4 }} />}
                      </td>
                      {visibleColumns.map(col => (
                        <td key={col.id} className={`px-3 py-2 border-r border-black last:border-r-0 ${col.align === 'center' ? 'text-center' : ''}`}>
                          {renderCell(col, e)}
                        </td>
                      ))}
                    </tr>
                    {isExpanded && <ExpandedDetail key={`detail-${e.id}`} e={e} colSpan={visibleColumns.length + 1} />}
                  </>
                );
              })}
            </tbody>
            <tfoot className="sticky bottom-0 z-10 border-t-2 border-black" style={{ background: WF.fill }}>
              <tr>
                <td className="px-2 py-2.5 border-r border-black" />
                {visibleColumns.map((col, i) => (
                  <td key={col.id} className={`px-3 py-2.5 border-r border-black last:border-r-0 ${col.align === 'center' ? 'text-center' : ''}`}>
                    {renderFooterCell(col, sorted, i === 0)}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
          </>
        )}
      </div>

      {chatOpen && (
        <div
          className="flex-none flex flex-col"
          style={{ width: '400px', background: WF.surface, borderLeft: `1px solid ${WF.border}` }}
        >
          <div
            className="flex-none flex items-center justify-between px-4 py-3"
            style={{ borderBottom: `1px solid ${WF.border}` }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 flex items-center justify-center text-[9px] font-semibold rounded-sm"
                style={{ border: `1px solid ${WF.borderStrong}`, background: WF.surfaceMuted, color: WF.textSecondary }}
              >
                O
              </div>
              <span className="text-sm font-semibold" style={{ color: WF.text }}>Obi</span>
              <span
                className="text-[9px] px-1.5 py-0.5 font-medium uppercase rounded-sm"
                style={{ background: WF.surfaceMuted, color: WF.muted, border: `1px solid ${WF.border}` }}
              >
                Chat panel
              </span>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="p-1 rounded-sm"
              style={{ border: `1px solid ${WF.border}`, background: WF.surface }}
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex-none px-4 py-2 border-b border-black">
            <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: WF.muted }}>
              Executive AI Readiness Briefing
            </p>
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
            {messages.map((m, i) => (
              <WireframeChatMessage key={`${m.type}-${i}`} item={m} onFollowUp={sendMessage} />
            ))}
          </div>
          <div className="flex-none px-4 py-2 border-t border-black overflow-x-auto">
            <div className="flex gap-1.5">
              {['Which departments are lagging?', 'Generate a VP readiness brief', 'Who should I activate as peer coaches?'].map(p => (
                <button key={p} type="button" onClick={() => sendMessage(p)} className="flex-none px-2 py-1 border border-black text-[10px] whitespace-nowrap" style={{ background: WF.surface }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-none px-4 py-3 border-t border-black">
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(chatInput)}
                placeholder="Ask about the data..."
                className="flex-1 px-3 py-2 text-xs outline-none border border-black"
                style={{ background: WF.bg, color: WF.text }}
              />
              <button type="button" onClick={() => sendMessage(chatInput)} className="px-3 py-2 text-xs font-semibold border border-black" style={{ background: WF.fillActive, color: WF.textOnActive }}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
