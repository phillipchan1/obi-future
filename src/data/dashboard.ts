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
};

export const DASHBOARD_COLORS = {
  bg: '#0D1117',
  card: '#161B22',
  border: 'rgba(255,255,255,0.08)',
  accent: '#2E75B6',
  green: '#3FB950',
  yellow: '#D29922',
  red: '#F85149',
  text: '#E6EDF3',
  muted: 'rgba(230,237,243,0.4)',
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
};

export const READINESS_DIST = [
  { level: 'Beginner' as const, count: 2, pct: 4, color: DASHBOARD_COLORS.red },
  { level: 'Learner' as const, count: 6, pct: 11, color: DASHBOARD_COLORS.yellow },
  { level: 'Familiar' as const, count: 16, pct: 31, color: DASHBOARD_COLORS.accent },
  { level: 'Skilled' as const, count: 29, pct: 54, color: DASHBOARD_COLORS.green },
];

function scoreBucketColor(range: string): string {
  const low = parseInt(range.split('–')[0], 10);
  if (low <= 50) return DASHBOARD_COLORS.red;
  if (low <= 70) return DASHBOARD_COLORS.yellow;
  return DASHBOARD_COLORS.green;
}

export const SCORE_BUCKETS = [
  { range: '0–10', count: 0 },
  { range: '11–20', count: 1 },
  { range: '21–30', count: 2 },
  { range: '31–40', count: 3 },
  { range: '41–50', count: 4 },
  { range: '51–60', count: 5 },
  { range: '61–70', count: 7 },
  { range: '71–80', count: 11 },
  { range: '81–90', count: 12 },
  { range: '91–100', count: 8 },
].map(b => ({ ...b, color: scoreBucketColor(b.range) }));

export const TREND_DATA = [
  { day: 'Day 1', avgScore: 62, cumCompletions: 8, cumRetakers: 1 },
  { day: 'Day 2', avgScore: 66, cumCompletions: 19, cumRetakers: 4 },
  { day: 'Day 3', avgScore: 69, cumCompletions: 31, cumRetakers: 9 },
  { day: 'Day 4', avgScore: 70, cumCompletions: 42, cumRetakers: 14 },
  { day: 'Day 5', avgScore: 71.4, cumCompletions: 53, cumRetakers: 19 },
];

export const INTELLIGENCE = {
  topDisruptedRoles: [
    { title: 'Senior Product Manager', disruptionScore: 8.4, avgReadiness: 72 },
    { title: 'Product Manager II', disruptionScore: 7.9, avgReadiness: 68 },
    { title: 'Business Analyst', disruptionScore: 7.2, avgReadiness: 61 },
  ],
  flagged: [
    { name: 'Jordan Lee', title: 'Product Manager II', disruptionScore: 8.1, finalScore: 54, level: 'Learner' as const },
    { name: 'Sam Ortiz', title: 'Senior Business Analyst', disruptionScore: 7.8, finalScore: 48, level: 'Beginner' as const },
    { name: 'Riley Chen', title: 'Associate PM', disruptionScore: 7.5, finalScore: 59, level: 'Learner' as const },
  ],
  courseCompletionByTier: { doNow: 34, doLater: 12, skip: 4 },
  copilotPercentiles: [
    { range: '0–25th', count: 8 },
    { range: '26–50th', count: 14 },
    { range: '51–75th', count: 19 },
    { range: '76–100th', count: 12 },
  ],
};

// My View — Phil Chan persona data
export const MY_VIEW = {
  persona: {
    name: 'Phil Chan',
    role: 'Senior Product Manager',
    department: 'Product & Design',
    aiLevel: 'Learner' as const,
    targetLevel: 'Familiar' as const,
    exposureScore: 8.4,
    finalScore: 78,
    firstScore: 71,
    day: 5,
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
  weeklyPlan: [
    { id: 'w1', week: 'Week 1', action: 'Install Copilot and connect it to Teams, Outlook, and Word' },
    { id: 'w2', week: 'Week 2', action: 'Complete your 4 core foundational courses (all under 35 min each)' },
    { id: 'w3', week: 'Week 3', action: 'Use Copilot to summarize a real meeting or draft a stakeholder email' },
    { id: 'w4', week: 'Week 4', action: 'Write your first AI-assisted PRD or strategy one-pager' },
    { id: 'w5', week: 'Week 5', action: 'Run an AI research synthesis session on real interview or survey data' },
    { id: 'w6', week: 'Week 6', action: "Use AI to stress-test your current roadmap — look for gaps you've missed" },
    { id: 'w7', week: 'Week 7', action: 'Teach one AI workflow to your team or a peer' },
    { id: 'w8', week: 'Week 8', action: 'Review your Copilot usage; set your next skill goal with your champion' },
  ],
  nextCourse: {
    title: 'Getting Started with Microsoft Copilot',
    source: 'LinkedIn Learning',
    duration: '32 min',
    reason: 'Your on-ramp. Covers Copilot in Teams, Outlook, and Word — do this first.',
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

function levelForScore(score: number): ReadinessLevel {
  if (score < 55) return 'Beginner';
  if (score < 68) return 'Learner';
  if (score < 82) return 'Familiar';
  return 'Skilled';
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
    return {
      id: i + 1,
      name,
      department: DEPTS[i % DEPTS.length],
      title: TITLES[i % TITLES.length],
      day: (i % 5) + 1,
      firstScore,
      finalScore,
      level,
      retook,
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
