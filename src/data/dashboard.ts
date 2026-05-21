export type ReadinessLevel = 'Beginner' | 'Learner' | 'Familiar' | 'Skilled';

export type EmployeeRecord = {
  id: number;
  name: string;
  department: string;
  title: string;
  day: number;
  firstScore: number;
  finalScore: number;
  level: ReadinessLevel;
  retook: boolean;
  copilotUsage: number;
  doNowComplete: number;
  doNowTotal: number;
  roleDisruptionPct: number;
  gapScore: number;
};

export function formatEmployeeId(id: number): string {
  return `Employee ${String(id).padStart(3, '0')}`;
}

export const DASHBOARD_COLORS = {
  bg: '#0D1117',
  card: '#161B22',
  border: '#2A3A4A',
  accent: '#2E75B6',
  green: '#3FB950',
  yellow: '#D29922',
  red: '#F85149',
  text: '#E6EDF3',
  muted: '#8B949E',
};

export const LEADER_STATS = {
  uniqueCompletions: 53,
  jobTitleCount: 23,
  completionRatePct: 5.3,
  rolloutDay: 5,
  reengagementRatePct: 34,
  reengagersCount: 19,
  avgScore: 71.4,
  medianScore: 78,
  medianCopilotUsage: 31,
  topQuartileBenchmark: 79,
  nonReengagedCount: 35,
  skilledPeerCoachCount: 3,
  scoreGainInRollout: 8,
};

export const READINESS_DIST = [
  { level: 'Beginner' as const, count: 2, pct: 4, color: DASHBOARD_COLORS.red },
  { level: 'Learner' as const, count: 6, pct: 11, color: DASHBOARD_COLORS.yellow },
  { level: 'Familiar' as const, count: 16, pct: 31, color: DASHBOARD_COLORS.accent },
  { level: 'Skilled' as const, count: 29, pct: 54, color: DASHBOARD_COLORS.green },
];

export const INTELLIGENCE = {
  topDisruptedRoles: [
    { title: 'Senior Product Manager', disruptionScore: 8.4, avgReadiness: 72 },
    { title: 'Product Manager II', disruptionScore: 7.9, avgReadiness: 68 },
    { title: 'Business Analyst', disruptionScore: 7.2, avgReadiness: 61 },
  ],
  flagged: [
    { employeeId: 3, title: 'Product Manager II', department: 'Product & Design', disruptionScore: 81, finalScore: 54, level: 'Learner' as const },
    { employeeId: 5, title: 'Senior Business Analyst', department: 'Operations', disruptionScore: 78, finalScore: 48, level: 'Beginner' as const },
    { employeeId: 4, title: 'Associate PM', department: 'Product & Design', disruptionScore: 75, finalScore: 59, level: 'Learner' as const },
  ],
  courseCompletionByTier: { doNow: 34, doLater: 12, skip: 4 },
  copilotPercentiles: [
    { range: '0–25th', count: 8 },
    { range: '26–50th', count: 14 },
    { range: '51–75th', count: 19 },
    { range: '76–100th', count: 12 },
  ],
};

export const MY_VIEW = {
  persona: {
    role: 'Senior Product Manager',
    department: 'Product & Design',
    aiLevel: 'Learner' as const,
    targetLevel: 'Familiar' as const,
    exposureScore: 8.4,
    finalScore: 78,
    firstScore: 71,
    day: 5,
    doNowRemaining: 4,
  },
  copilot: {
    period: 'Last 90 days',
    chatCount: 47,
    percentile: 62,
    orgMedian: 31,
    orgAvg: 38,
    benchmarkMinutesPerChat: 4,
    weeklyTrend: [3, 5, 4, 8, 6, 9, 7, 5, 6, 4, 5, 7, 8],
    peerLabel: 'Product & Design org',
  },
};

const NAMES = [
  'Phil Chan', 'Marcus Webb', 'Jordan Lee', 'Riley Chen', 'Sam Ortiz', 'Alex Kim', 'Taylor Brooks',
  'Morgan Davis', 'Casey Nguyen', 'Jamie Park', 'Drew Martinez', 'Quinn Adams', 'Avery Wilson',
  'Blake Torres', 'Cameron Reed', 'Dana Foster', 'Ellis Gray', 'Finley Hunt', 'Gray Shaw',
  'Harper Bell', 'Indigo Cole', 'Jesse Lane', 'Kai Monroe', 'Logan Pierce', 'Marley Quinn',
  'Noah Blake', 'Oakley Cruz', 'Parker Dean', 'Reese Ellis', 'Sage Flynn', 'Tatum Grant',
  'Uma Hayes', 'Vale Ingram', 'Wren James', 'Xander Knox', 'Yael Lopez', 'Zion Marsh',
  'Adrian North', 'Brook Ortiz', 'Cedar Price', 'Dune Ramos', 'Ember Stone', 'Flint Vega',
  'Glen Wade', 'Haven York', 'Iris Zane', 'Jules Abbott', 'Kiran Booth', 'Lena Cross',
  'Milo Drake', 'Nico Edge', 'Orion Fisk', 'Pia Gould',
];

const DEPTS = ['Product & Design', 'Engineering', 'Operations', 'Customer Success', 'Marketing', 'IT', 'Finance', 'HR'];
const TITLES = [
  'Senior Product Manager', 'Product Manager II', 'Associate PM', 'Principal PM',
  'Business Analyst', 'Senior Business Analyst', 'Data Analyst',
  'Engineering Manager', 'Software Engineer II', 'UX Designer',
  'Marketing Manager', 'Content Strategist', 'Customer Success Manager',
  'Operations Analyst', 'Program Manager', 'Technical Writer',
  'Director of Product', 'VP Product', 'Scrum Master',
  'Solutions Architect', 'DevOps Engineer', 'QA Lead',
  'Research Lead', 'Design Lead',
];

function disruptionPctForTitle(title: string, i: number): number {
  if (title.includes('Research') || title.includes('Analyst') || title.includes('Product Manager')) {
    return 85 + (i % 10);
  }
  if (title.includes('Designer') || title.includes('Engineer')) return 65 + (i % 15);
  return 45 + (i % 25);
}

function buildEmployees(): EmployeeRecord[] {
  const levelTargets: ReadinessLevel[] = [
    ...Array(2).fill('Beginner'),
    ...Array(6).fill('Learner'),
    ...Array(16).fill('Familiar'),
    ...Array(29).fill('Skilled'),
  ] as ReadinessLevel[];

  const scoreRanges: Record<ReadinessLevel, [number, number]> = {
    Beginner: [42, 54],
    Learner: [55, 67],
    Familiar: [68, 81],
    Skilled: [82, 98],
  };

  return NAMES.map((name, i) => {
    const level = levelTargets[i];
    const [min, max] = scoreRanges[level];
    const finalScore = min + ((i * 7) % (max - min + 1));
    const firstScore = Math.max(40, finalScore - (i % 5 === 0 ? 8 : 3));
    const retook = i % 3 === 0 || (firstScore < 65 && finalScore >= 65);
    const title = TITLES[i % TITLES.length];
    const roleDisruptionPct = disruptionPctForTitle(title, i);
    const gapScore = Math.round(roleDisruptionPct - finalScore);
    const copilotUsage = 12 + ((i * 13) % 75);
    const doNowComplete = level === 'Skilled' ? 5 : level === 'Familiar' ? 3 + (i % 3) : level === 'Learner' ? 1 + (i % 3) : i % 2;

    return {
      id: i + 1,
      name,
      department: DEPTS[i % DEPTS.length],
      title,
      day: (i % 5) + 1,
      firstScore,
      finalScore,
      level,
      retook,
      copilotUsage,
      doNowComplete,
      doNowTotal: 5,
      roleDisruptionPct,
      gapScore,
    };
  });
}

export const EMPLOYEES = buildEmployees();

export const LEVEL_COLORS: Record<ReadinessLevel, string> = {
  Beginner: DASHBOARD_COLORS.red,
  Learner: DASHBOARD_COLORS.yellow,
  Familiar: DASHBOARD_COLORS.accent,
  Skilled: DASHBOARD_COLORS.green,
};
