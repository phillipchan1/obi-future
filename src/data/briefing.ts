import {
  EMPLOYEES,
  INTELLIGENCE,
  LEADER_STATS,
  type EmployeeRecord,
} from './dashboard';

export const TREND_DATA = [
  { day: 1, avgScore: 62, benchmark: 79 },
  { day: 2, avgScore: 66, benchmark: 79 },
  { day: 3, avgScore: 69, benchmark: 79 },
  { day: 4, avgScore: 70, benchmark: 79 },
  { day: 5, avgScore: 71.4, benchmark: 79 },
];

const RISK_TITLES = /Research|Analyst|Product|PM|Associate/i;

export function getAtRiskEmployees(): EmployeeRecord[] {
  const flaggedIds = new Set(INTELLIGENCE.flagged.map(f => f.employeeId));
  const primary = EMPLOYEES.filter(
    e =>
      flaggedIds.has(e.id) ||
      ((e.level === 'Beginner' || e.level === 'Learner') &&
        e.gapScore > 25 &&
        RISK_TITLES.test(e.title))
  );
  const seen = new Set<number>();
  const result: EmployeeRecord[] = [];
  for (const e of primary) {
    if (!seen.has(e.id)) {
      seen.add(e.id);
      result.push(e);
    }
  }
  if (result.length < 6) {
    const extra = EMPLOYEES.filter(
      e => !seen.has(e.id) && (e.level === 'Beginner' || e.level === 'Learner')
    )
      .sort((a, b) => b.gapScore - a.gapScore)
      .slice(0, 6 - result.length);
    result.push(...extra);
  }
  return result.slice(0, 6);
}

export const PEER_COACH_IDS = [29, 31, 33];

export function getPeerCoaches(): (EmployeeRecord & { mapsTo: string })[] {
  const maps = ['Discovery & Research', 'Operations', 'Product & Design'];
  return PEER_COACH_IDS.map((id, i) => {
    const e = EMPLOYEES.find(emp => emp.id === id)!;
    return { ...e, mapsTo: maps[i] ?? 'lowest-readiness group' };
  }).filter(e => e.id);
}

export function daysSinceActive(day: number): number {
  return LEADER_STATS.rolloutDay - day + 1;
}
