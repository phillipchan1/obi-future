import {
  EMPLOYEES,
  LEADER_STATS,
  hasCompletedAssessment,
  type EmployeeRecord,
  type ReadinessLevel,
} from './dashboard';
import { getAtRiskEmployees } from './briefing';

export const EXEC_LAST_UPDATED = 'May 21, 2026 · 6:42 AM';

export type CannedViewId = 'my-org' | 'it-levels' | 'safety-ou';

export const CANNED_VIEWS: { id: CannedViewId; label: string; departments: string[] | null }[] = [
  { id: 'my-org', label: 'My org', departments: null },
  {
    id: 'it-levels',
    label: 'ETS',
    departments: ['Infrastructure & Cloud', 'Application Services', 'Network & Security', 'Service Desk'],
  },
  {
    id: 'safety-ou',
    label: 'DPT + DGS',
    departments: [
      'Process Excellence',
      'Automation & AI',
      'Change Enablement',
      'Portfolio Ops',
      'Data Platforms',
      'Analytics & Insights',
      'Governance & Quality',
      'Integration Services',
    ],
  },
];

export const ALL_DEPARTMENTS = [...new Set(EMPLOYEES.map(e => e.department))].sort();

export type DisruptionRiskLevel = 'Low' | 'Medium' | 'High';

export type ExecKpis = {
  orgReadiness: number;
  readinessDeltaQoq: number;
  criticalGaps: number;
  skilledCount: number;
  skilledTrendQoq: number;
  disruptionRisk: DisruptionRiskLevel;
};

export type ExecInsightTone = 'urgent' | 'warning' | 'positive' | 'info';

export type ExecInsightCard = {
  id: string;
  tone: ExecInsightTone;
  badge: string;
  title: string;
  explanation: [string, string];
  chatPrefill: string;
};

export type DeptScoreRow = {
  department: string;
  avgScore: number;
  assessedCount: number;
  color: 'red' | 'amber' | 'green';
};

export type LevelSlice = {
  level: ReadinessLevel;
  count: number;
  pct: number;
};

export type HeatMapCell = {
  department: string;
  level: ReadinessLevel;
  count: number;
  intensity: number;
};

export const QUARTER_SKILLED_TREND = [
  { quarter: 'Q1', skilledPct: 38 },
  { quarter: 'Q2', skilledPct: 42 },
  { quarter: 'Q3', skilledPct: 48 },
  { quarter: 'Q4', skilledPct: 54 },
];

const LEVELS: ReadinessLevel[] = ['Beginner', 'Learner', 'Familiar', 'Skilled'];

function filterByDepartments(
  departments: string[] | null,
): EmployeeRecord[] {
  if (!departments?.length) return EMPLOYEES;
  return EMPLOYEES.filter(e => departments.includes(e.department));
}

export function scopeEmployees(
  cannedView: CannedViewId,
  departmentFilter: string | null,
): EmployeeRecord[] {
  const canned = CANNED_VIEWS.find(v => v.id === cannedView);
  let pool = filterByDepartments(canned?.departments ?? null);
  if (departmentFilter) {
    pool = pool.filter(e => e.department === departmentFilter);
  }
  return pool;
}

export function computeExecKpis(employees: EmployeeRecord[]): ExecKpis {
  const assessed = employees.filter(hasCompletedAssessment);
  const avgScore = assessed.length
    ? Math.round((assessed.reduce((s, e) => s + (e.finalScore ?? 0), 0) / assessed.length) * 10) / 10
    : 0;

  const atRiskInScope = getAtRiskEmployees().filter(e =>
    employees.some(p => p.id === e.id),
  ).length;

  const skilledCount = assessed.filter(e => e.level === 'Skilled').length;
  const skilledPct = assessed.length ? (skilledCount / assessed.length) * 100 : 0;
  const priorSkilledPct = Math.max(0, skilledPct - 6);

  let disruptionRisk: DisruptionRiskLevel = 'Low';
  if (atRiskInScope >= 5 || avgScore < 65) disruptionRisk = 'High';
  else if (atRiskInScope >= 3 || avgScore < 72) disruptionRisk = 'Medium';

  return {
    orgReadiness: avgScore || LEADER_STATS.avgScore,
    readinessDeltaQoq: 3.2,
    criticalGaps: atRiskInScope || Math.min(6, getAtRiskEmployees().length),
    skilledCount: skilledCount || LEADER_STATS.skilledPeerCoachCount + 26,
    skilledTrendQoq: Math.round((skilledPct - priorSkilledPct) * 10) / 10,
    disruptionRisk,
  };
}

export function getExecInsightCards(employees: EmployeeRecord[]): ExecInsightCard[] {
  const assessed = employees.filter(hasCompletedAssessment);
  const avgScore = assessed.length
    ? assessed.reduce((s, e) => s + (e.finalScore ?? 0), 0) / assessed.length
    : LEADER_STATS.avgScore;
  const gapToBenchmark = LEADER_STATS.topQuartileBenchmark - avgScore;
  const atRisk = getAtRiskEmployees().filter(e => employees.some(p => p.id === e.id)).length;

  return [
    {
      id: 'urgent-exposure',
      tone: 'urgent',
      badge: 'Urgent',
      title: 'Highest-disruption roles are still at Beginner/Learner',
      explanation: [
        `${atRisk || 6} employees in AI-exposed roles haven't progressed since Day 1 of rollout.`,
        'McKinsey 2025 flags this cluster as facing fundamental workflow change within 18 months — intervention this month, not next quarter.',
      ],
      chatPrefill: 'Which roles are most exposed and least ready?',
    },
    {
      id: 'warning-benchmark',
      tone: 'warning',
      badge: 'Benchmark gap',
      title: `${Math.round(gapToBenchmark)} pts behind top-quartile utility peers`,
      explanation: [
        `Org average is ${Math.round(avgScore * 10) / 10}; sector top quartile sits at ${LEADER_STATS.topQuartileBenchmark}+.`,
        'Trajectory is positive (+8 pts in 5 days) — the window to close the gap is open if workflow adoption accelerates.',
      ],
      chatPrefill: 'How do we compare to the utility sector?',
    },
    {
      id: 'positive-coaches',
      tone: 'positive',
      badge: 'Quick win',
      title: '3 peer coaches map to your lowest-readiness pockets',
      explanation: [
        'Skilled employees in Product, Operations, and Research clusters can anchor peer-led workflow demos.',
        'HBR 2024: peer transfer closes the knowing-doing gap 40% faster than instructor-led training.',
      ],
      chatPrefill: 'Who should I activate as peer coaches?',
    },
    {
      id: 'info-workflow',
      tone: 'info',
      badge: 'Structural',
      title: 'Workflow Impact is the org-wide bottleneck',
      explanation: [
        'Prompting and Mindset score fine — people understand AI conceptually but aren\'t changing daily work yet.',
        'Copilot usage median is 31 chats/quarter vs 70+ for top performers; a workflow sprint beats another course.',
      ],
      chatPrefill: 'Is that a training problem or a people problem?',
    },
  ];
}

function scoreColor(avg: number): 'red' | 'amber' | 'green' {
  if (avg < 65) return 'red';
  if (avg < 75) return 'amber';
  return 'green';
}

export function getDeptScoreRows(employees: EmployeeRecord[]): DeptScoreRow[] {
  const depts = [...new Set(employees.map(e => e.department))].sort();
  return depts.map(department => {
    const assessed = employees.filter(e => e.department === department && hasCompletedAssessment(e));
    const avgScore = assessed.length
      ? Math.round((assessed.reduce((s, e) => s + (e.finalScore ?? 0), 0) / assessed.length) * 10) / 10
      : 0;
    return {
      department,
      avgScore,
      assessedCount: assessed.length,
      color: scoreColor(avgScore),
    };
  }).sort((a, b) => a.avgScore - b.avgScore);
}

export function getLevelDistribution(employees: EmployeeRecord[]): LevelSlice[] {
  const assessed = employees.filter(hasCompletedAssessment);
  const counts: Record<ReadinessLevel, number> = {
    Beginner: 0,
    Learner: 0,
    Familiar: 0,
    Skilled: 0,
  };
  for (const e of assessed) {
    if (e.level) counts[e.level]++;
  }
  return LEVELS.map(level => ({
    level,
    count: counts[level],
    pct: assessed.length ? Math.round((counts[level] / assessed.length) * 100) : 0,
  }));
}

export function getHeatMapCells(employees: EmployeeRecord[]): HeatMapCell[] {
  const depts = [...new Set(employees.map(e => e.department))].sort();
  const cells: HeatMapCell[] = [];
  let maxCount = 1;

  for (const department of depts) {
    for (const level of LEVELS) {
      const count = employees.filter(
        e => e.department === department && hasCompletedAssessment(e) && e.level === level,
      ).length;
      if (count > maxCount) maxCount = count;
      cells.push({ department, level, count, intensity: 0 });
    }
  }

  return cells.map(c => ({
    ...c,
    intensity: maxCount ? c.count / maxCount : 0,
  }));
}

export function filterEmployeesByHeatCell(
  employees: EmployeeRecord[],
  department: string,
  level: ReadinessLevel,
): EmployeeRecord[] {
  return employees.filter(
    e => e.department === department && hasCompletedAssessment(e) && e.level === level,
  );
}
