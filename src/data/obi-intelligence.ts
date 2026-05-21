import { LEADER_STATS } from './dashboard';

export type InsightSeverity = 'risk' | 'watch' | 'opportunity';

export type InsightCardData = {
  id: string;
  severity: InsightSeverity;
  tagPrimary: string;
  tagSecondary: string;
  headline: string;
  sentences: [string, string, string];
  source: string;
  chatPrefill: string;
  widthClass: string;
  bgColor: string;
  headlineSize: string;
};

export type ObiResponse = {
  summary: string;
  internal: string[];
  research: { text: string; citation: string };
  action: string;
  followUps: string[];
  showReport?: boolean;
};

export const LEADER_CONTEXT = {
  leaderName: 'Albert Ma',
  title: 'IT Head',
  companyEmployeeCount: 1353,
  department: 'Product & Design',
  departmentAssessed: 53,
  benchmarkLabel: 'Benchmarked against utility sector',
  scopeLabel: 'Department forest view',
};

export const ALARM_BANNER = {
  hero: "6 employees in your highest-risk roles haven't progressed since Day 1.",
  sub: 'Discovery & Research roles are 92% AI-disrupted per McKinsey 2025. These employees are your most urgent intervention.',
  ctaPrefill: 'Which roles are most exposed and least ready?',
  timestamp: 'As of May 21, 2026',
};

export const INSIGHT_CARDS: InsightCardData[] = [
  {
    id: 'risk-1',
    severity: 'risk',
    tagPrimary: 'RISK',
    tagSecondary: 'INTERNAL + RESEARCH',
    headline: 'Your most AI-exposed roles are your least ready',
    sentences: [
      '6 employees in Discovery & Research — rated 92% AI-disrupted — are at Beginner level.',
      "McKinsey's 2025 utility sector analysis identifies this cluster as facing fundamental transformation within 18 months.",
      'This is not a training gap — it is a strategic risk.',
    ],
    source: 'McKinsey Global Institute, 2025',
    chatPrefill: 'Which roles are most exposed and least ready?',
    widthClass: 'lg:w-[42%]',
    bgColor: '#1F0F3D',
    headlineSize: 'text-2xl',
  },
  {
    id: 'benchmark-1',
    severity: 'watch',
    tagPrimary: 'BENCHMARK',
    tagSecondary: 'BENCHMARK',
    headline: '8 points behind top-quartile utility orgs — but your trajectory is stronger',
    sentences: [
      `Your team averages ${LEADER_STATS.avgScore}.`,
      `Top-quartile utility benchmark is ${LEADER_STATS.topQuartileBenchmark}+ (Microsoft Work Trend Index 2025) — at your current growth rate you reach benchmark in approximately 11 weeks.`,
      'The window is open.',
    ],
    source: 'Microsoft Work Trend Index, 2025',
    chatPrefill: 'How do we compare to the utility sector?',
    widthClass: 'lg:w-[30%]',
    bgColor: '#2D1B69',
    headlineSize: 'text-xl',
  },
  {
    id: 'opportunity-1',
    severity: 'opportunity',
    tagPrimary: 'OPPORTUNITY',
    tagSecondary: 'TREND',
    headline: 'Peer coaching could accelerate your lowest-readiness teams 40% faster',
    sentences: [
      '3 Skilled employees map directly to your lowest-readiness groups.',
      'HBR (2024) found peer-led AI skill transfer outperforms instructor-led training by 40% in enterprise settings.',
      'These people are your fastest free win.',
    ],
    source: 'Harvard Business Review, 2024',
    chatPrefill: 'Who should I activate as peer coaches?',
    widthClass: 'lg:w-[28%]',
    bgColor: '#0F2A1A',
    headlineSize: 'text-xl',
  },
];

export const LIVE_FEED = [
  {
    id: 'f1',
    source: 'WEF',
    insight: 'AI-native teams are shipping 2x faster — becoming a hiring expectation at top companies',
    prefill: 'Are my teams shipping faster with AI?',
  },
  {
    id: 'f2',
    source: 'Microsoft',
    insight: `Top 85th percentile: 70+ Copilot chats/quarter. Your team median: ${LEADER_STATS.medianCopilotUsage}`,
    prefill: "What's driving the Copilot usage gap on my team?",
  },
  {
    id: 'f3',
    source: 'Nielsen Norman',
    insight: 'Prompting is now a core professional skill — structurally similar to writing clear requirements',
    prefill: 'Which of my employees have strong prompting skills?',
  },
  {
    id: 'f4',
    source: 'McKinsey',
    insight: 'Companies investing in AI fluency now will have compounding advantage over the next 3-5 years',
    prefill: "What's our AI fluency trajectory look like?",
  },
  {
    id: 'f5',
    source: 'HBR',
    insight: 'Employees who retook assessment scored +8 points avg — re-engagement is high leverage',
    prefill: 'Which employees should I target for re-engagement?',
  },
  {
    id: 'f6',
    source: 'Microsoft',
    insight: 'PMs who build AI fluency now will outperform peers significantly within 18 months',
    prefill: 'Who on my team is best positioned to lead AI adoption?',
  },
];

export const CHAT_QUICK_PROMPTS = [
  { id: 'diagnose', icon: '🔍', label: 'Diagnose', preview: 'Where is our biggest risk right now?', prefill: 'Where is our biggest strategic risk right now?' },
  { id: 'benchmark', icon: '📊', label: 'Benchmark', preview: 'How do we compare to the utility sector?', prefill: 'How do we compare to the utility sector?' },
  { id: 'project', icon: '📈', label: 'Project', preview: 'When do we hit the sector benchmark?', prefill: 'At current pace when do we hit the sector benchmark?' },
  { id: 'activate', icon: '⚡', label: 'Activate', preview: 'Who should I activate as peer coaches?', prefill: 'Who should I activate as peer coaches?' },
  { id: 'report', icon: '📄', label: 'Report', preview: 'Generate a VP readiness brief', prefill: 'Generate a VP readiness brief' },
  { id: 'investigate', icon: '🔎', label: 'Investigate', preview: "Why haven't 35 employees re-engaged?", prefill: "Why haven't 35 employees re-engaged?" },
];

export type ChatCategoryId = 'diagnose' | 'benchmark' | 'project' | 'activate' | 'report' | 'investigate';

export const CHAT_CATEGORIES: {
  id: ChatCategoryId;
  label: string;
  icon: string;
  prompts: string[];
}[] = [
  {
    id: 'diagnose',
    label: 'Diagnose',
    icon: 'search',
    prompts: [
      'Where is our biggest strategic risk right now?',
      'Which roles are most exposed and least ready?',
    ],
  },
  {
    id: 'benchmark',
    label: 'Benchmark',
    icon: 'bar-chart',
    prompts: [
      'How do we compare to the utility sector?',
      'Where do we rank on Copilot adoption vs industry?',
    ],
  },
  {
    id: 'project',
    label: 'Project',
    icon: 'trending-up',
    prompts: [
      'At current pace when do we hit the sector benchmark?',
      'What happens to our score if 20 more employees complete Do Now?',
    ],
  },
  {
    id: 'activate',
    label: 'Activate',
    icon: 'zap',
    prompts: [
      'Who should I activate as peer coaches?',
      'Which managers have the highest-readiness departments?',
    ],
  },
  {
    id: 'report',
    label: 'Report',
    icon: 'file-text',
    prompts: [
      'Generate a VP readiness brief',
      'Create a 1-page summary for our next leadership meeting',
    ],
  },
  {
    id: 'investigate',
    label: 'Investigate',
    icon: 'microscope',
    prompts: [
      'Why did scores plateau in week 3?',
      'Which employees retook and improved the most?',
      "Why haven't 35 employees re-engaged?",
    ],
  },
];

export const VP_BRIEF = {
  title: 'TEAM AI READINESS — EXECUTIVE BRIEF',
  subtitle: 'Product & Design · Albert Ma · May 21 2026',
  intro: "Here's your executive brief — based on live assessment data cross-referenced with utility sector benchmarks.",
  sections: [
    {
      heading: 'WHERE WE ARE',
      bullets: [
        `· ${LEADER_STATS.uniqueCompletions} assessed across 23 job titles`,
        `· Avg score: ${LEADER_STATS.avgScore} · 54% at Skilled level`,
        `· Organic participation: ${LEADER_STATS.completionRatePct}% — no mandate`,
        `· Score trajectory: +${LEADER_STATS.scoreGainInRollout} pts in first ${LEADER_STATS.rolloutDay} days`,
      ],
    },
    {
      heading: 'WHERE THE INDUSTRY IS',
      bullets: [
        `· Utility benchmark (top quartile): ${LEADER_STATS.topQuartileBenchmark}+`,
        '  [Microsoft Work Trend Index 2025]',
        '· AI-native teams shipping 2x faster',
        '  [WEF Future of Jobs 2025]',
        '· 18-month compounding advantage window',
        '  [McKinsey Global Institute 2025]',
      ],
    },
    {
      heading: 'OUR RISK',
      bullets: [
        '· 6 employees: highest disruption, lowest readiness — urgent',
        `· ${LEADER_STATS.nonReengagedCount} employees not re-engaged since Day 1`,
      ],
    },
    {
      heading: 'OUR PATH',
      bullets: [
        `· Activate ${LEADER_STATS.skilledPeerCoachCount} identified peer coaches`,
        `· Re-engage ${LEADER_STATS.nonReengagedCount} non-returners`,
        '· Benchmark arrival: ~11 weeks at current trajectory',
      ],
    },
  ],
};

export const MY_VIEW_PERSONA = { firstName: 'Phil' };

export const MY_VIEW_CARDS = [
  {
    id: 'mv1',
    type: 'pressure' as const,
    tag: 'PRESSURE',
    headline: 'Your role is 8.4/10 AI-disrupted',
    body: 'Discovery & Research is facing fundamental change within 18 months per McKinsey. Your current level: Learner. The gap between where you are and where your role is going is closeable — but the window is now.',
    source: 'McKinsey Global Institute, 2025',
    bgColor: '#2D1B69',
    borderColor: '#D29922',
  },
  {
    id: 'mv2',
    type: 'benchmark' as const,
    tag: 'BENCHMARK',
    headline: "You're in the 62nd percentile of Copilot usage on your team",
    body: "Top performers average 70+ chats per quarter. You're at 31. Microsoft data shows the gap between median and top users compounds — top users get 2x the productivity benefit within 6 months.",
    source: 'Microsoft Work Trend Index, 2025',
    bgColor: '#2D1B69',
    borderColor: '#6B46C1',
  },
  {
    id: 'mv3',
    type: 'opportunity' as const,
    tag: 'OPPORTUNITY',
    headline: 'Finishing Do Now in week 1 leads to 3x retention',
    body: 'Employees who complete their first 2 courses within 7 days retain skills at 3x the rate of those who delay. You have 4 Do Now courses remaining.',
    source: 'Learning & Development Research, 2024',
    bgColor: '#0F2A1A',
    borderColor: '#3FB950',
  },
];

export const MY_VIEW_CHAT_PROMPTS = [
  'What should I focus on this week?',
  'How do I compare to others in my role?',
  "What's my biggest skill gap right now?",
  'Am I on track for my 8-week plan?',
];

export const DATA_CHAT_PREFILL =
  'Analyze my team data and surface the top 3 things I should act on this week';

export const CHAT_DEMO_SEED = {
  userMessage: 'Generate a VP readiness brief',
  obiIntro: VP_BRIEF.intro,
};

export const VP_REPORT_FOLLOWUPS = [
  'Add department comparison →',
  'Flag specific employees for follow-up →',
];

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

const RESPONSE_MAP: { match: (q: string) => boolean; response: ObiResponse }[] = [
  {
    match: q => q.includes('vp readiness brief') || q.includes('generate a vp'),
    response: {
      summary: VP_BRIEF.intro,
      internal: [
        `${LEADER_STATS.uniqueCompletions} assessed employees with department average ${LEADER_STATS.avgScore}`,
        `${LEADER_STATS.reengagersCount} retook (${LEADER_STATS.reengagementRatePct}% re-engagement)`,
        `6 high-exposure / low-readiness employees in Discovery & Research`,
      ],
      research: {
        text: 'Top-quartile utility orgs maintain 79+ readiness with 70+ Copilot chats/quarter at the 85th percentile.',
        citation: 'Microsoft Work Trend Index 2025',
      },
      action: 'Share this brief with your VP and schedule a 30-minute activation review for peer coaches.',
      followUps: VP_REPORT_FOLLOWUPS,
      showReport: true,
    },
  },
  {
    match: q =>
      q.includes("haven't 35") ||
      (q.includes('35 employees') && q.includes('re-engag')) ||
      q.includes('re-engaged'),
    response: {
      summary: `${LEADER_STATS.nonReengagedCount} employees have not returned since Day 1 — your largest participation gap.`,
      internal: [
        'Organic participation is 5.3% — no mandate driving completions',
        'Retakers average +8 pts; only 19 of 53 have returned',
        'Day 3–4 is the peak window for re-engagement nudges',
      ],
      research: {
        text: 'HBR 2024: targeted re-engagement within 7 days of first touch retains 3x more skill gain than delayed outreach.',
        citation: 'Harvard Business Review, 2024',
      },
      action: 'Send personalized retake prompts to non-returners with their top Do Now course linked.',
      followUps: ['Which employees should I target for re-engagement?', 'Generate a VP readiness brief'],
    },
  },
  {
    match: q => q.includes('leadership meeting') || q.includes('1-page summary'),
    response: {
      summary: 'Your 1-page leadership summary is ready — key metrics and three actions.',
      internal: [
        `Avg score ${LEADER_STATS.avgScore}, +${LEADER_STATS.scoreGainInRollout} pts over ${LEADER_STATS.rolloutDay} days`,
        `54% Skilled · ${LEADER_STATS.completionRatePct}% organic participation`,
        `${LEADER_STATS.nonReengagedCount} employees have not re-engaged`,
      ],
      research: {
        text: 'WEF 2025: AI-native teams are shipping 2x faster than peers still in adoption phase.',
        citation: 'WEF Future of Jobs 2025',
      },
      action: 'Lead with benchmark gap (8 pts) and peer-coach activation as your two asks.',
      followUps: ['Generate a VP readiness brief', 'Who should I activate as peer coaches?'],
      showReport: true,
    },
  },
  {
    match: q => q.includes('strategic risk') || q.includes('biggest risk'),
    response: {
      summary: 'Your biggest strategic risk is high AI exposure paired with Beginner readiness in Discovery & Research.',
      internal: [
        '6 employees in Discovery & Research at Beginner with 92% role disruption',
        'Gap scores exceed 30 for 4 of these employees',
        'Only 2 have started Do Now courses',
      ],
      research: {
        text: 'McKinsey 2025 utility analysis: this role cluster faces fundamental transformation within 18 months.',
        citation: 'McKinsey Global Institute, 2025',
      },
      action: 'Prioritize a targeted Do Now sprint for Discovery & Research this week.',
      followUps: ['Which roles are most exposed and least ready?', 'Who should I activate as peer coaches?'],
    },
  },
  {
    match: q => q.includes('exposed') && q.includes('least ready'),
    response: {
      summary: 'Discovery & Research roles show the widest exposure-readiness gap in your department.',
      internal: [
        '6 employees: 92% AI-disrupted roles, Beginner level',
        'Employee 003, 004, 005 flagged with gap scores > 30',
        'Cluster avg readiness: 52 vs department avg 71.4',
      ],
      research: {
        text: 'Roles above 85% disruption without Familiar+ readiness face 3x higher transformation risk.',
        citation: 'McKinsey Global Institute, 2025',
      },
      action: 'Pair each flagged employee with a Skilled peer coach from the same department.',
      followUps: ['Who should I activate as peer coaches?', 'Analyze my department\'s data and surface the top 3 things I should act on'],
    },
  },
  {
    match: q => q.includes('utility sector') || q.includes('compare'),
    response: {
      summary: `You are ${LEADER_STATS.topQuartileBenchmark - LEADER_STATS.avgScore} points behind top-quartile utility orgs, with stronger-than-average trajectory.`,
      internal: [
        `Department avg: ${LEADER_STATS.avgScore} · Top quartile benchmark: ${LEADER_STATS.topQuartileBenchmark}+`,
        `+${LEADER_STATS.scoreGainInRollout} pts in ${LEADER_STATS.rolloutDay} days`,
        'Estimated benchmark arrival: ~11 weeks at current pace',
      ],
      research: {
        text: 'Microsoft Work Trend Index 2025: utility sector top quartile maintains 79+ readiness scores.',
        citation: 'Microsoft Work Trend Index, 2025',
      },
      action: 'Maintain current rollout cadence; add Copilot usage targets for Familiar-tier employees.',
      followUps: ['At current pace when do we hit the sector benchmark?', 'Where do we rank on Copilot adoption vs industry?'],
    },
  },
  {
    match: q => q.includes('copilot adoption') || q.includes('copilot'),
    response: {
      summary: `Your median Copilot usage (${LEADER_STATS.medianCopilotUsage}/quarter) is below the 85th-percentile benchmark of 70+.`,
      internal: [
        `Median: ${LEADER_STATS.medianCopilotUsage} chats · Top performers: 70+`,
        '29 Skilled employees — best candidates to model usage patterns',
        '12 employees in bottom quartile of usage',
      ],
      research: {
        text: 'Nielsen Norman 2025: prompting fluency is now a core PM skill tied to Copilot adoption.',
        citation: 'Nielsen Norman Group, 2025',
      },
      action: 'Set a department-wide Copilot usage floor of 40 chats/quarter for Familiar tier.',
      followUps: ['Who should I activate as peer coaches?', 'How do we compare to the utility sector?'],
    },
  },
  {
    match: q => q.includes('benchmark') && (q.includes('pace') || q.includes('when')),
    response: {
      summary: 'At your current +1.6 pts/day trajectory, you reach the sector benchmark in approximately 11 weeks.',
      internal: [
        `Current avg: ${LEADER_STATS.avgScore} · Target: ${LEADER_STATS.topQuartileBenchmark}+`,
        `Gap: ${(LEADER_STATS.topQuartileBenchmark - LEADER_STATS.avgScore).toFixed(1)} pts over ~49 days`,
        `${LEADER_STATS.reengagersCount} retakers contributing +8 pts avg lift`,
      ],
      research: {
        text: 'Microsoft Work Trend Index: utility orgs at top quartile sustain 79+ through sustained Copilot adoption.',
        citation: 'Microsoft Work Trend Index, 2025',
      },
      action: 'Accelerate by 2 weeks if you activate peer coaches and re-engage non-returners.',
      followUps: ['What happens to our score if 20 more employees complete Do Now?', 'Generate a VP readiness brief'],
    },
  },
  {
    match: q => q.includes('20 more') || q.includes('do now'),
    response: {
      summary: 'If 20 more employees complete Do Now, projected department avg rises to ~76.2 within 3 weeks.',
      internal: [
        'Current Do Now completion rate: 34%',
        'Early completers score +11 pts vs late starters',
        '20 additional completions ≈ +4.8 pts department avg lift',
      ],
      research: {
        text: 'HBR 2024: structured early action items outperform passive content consumption by 40%.',
        citation: 'Harvard Business Review, 2024',
      },
      action: 'Send a targeted nudge to 35 non-engaged employees with their top Do Now course.',
      followUps: ['Who should I activate as peer coaches?', 'At current pace when do we hit the sector benchmark?'],
    },
  },
  {
    match: q => q.includes('peer coach'),
    response: {
      summary: `Activate 3 Skilled employees as peer coaches — they map to your lowest-readiness groups.`,
      internal: [
        'Employee 029, 031, 033: Skilled, high Copilot usage (65+), Familiar+ readiness',
        'Each maps to Discovery & Research or Operations role families',
        'Projected 40% faster skill transfer vs instructor-led',
      ],
      research: {
        text: 'HBR 2024: peer-led AI skill transfer outperforms instructor-led training by 40% in enterprise settings.',
        citation: 'Harvard Business Review, 2024',
      },
      action: 'Schedule 30-min kickoffs with each coach this week; pair 2 mentees per coach.',
      followUps: ['Which managers have the highest-readiness departments?', 'Generate a VP readiness brief'],
    },
  },
  {
    match: q => q.includes('managers') && q.includes('highest'),
    response: {
      summary: 'Product & Design and IT managers lead on readiness; Operations lags by 12 pts.',
      internal: [
        'Product & Design avg: 74.2 · IT avg: 72.8',
        'Operations avg: 62.1 · 4 flagged employees',
        'Marketing: strongest Copilot adoption growth (+15% week over week)',
      ],
      research: {
        text: 'Microsoft Work Trend Index: manager Copilot usage correlates 0.72 with team adoption.',
        citation: 'Microsoft Work Trend Index, 2025',
      },
      action: 'Ask Product & Design managers to share their Copilot workflow in the next staff meeting.',
      followUps: ['Who should I activate as peer coaches?', 'Why did scores drop in week 3?'],
    },
  },
  {
    match: q => q.includes('week 3') || q.includes('scores drop'),
    response: {
      summary: 'Week 3 dip was driven by a batch of new completions from lower-readiness employees, not regression.',
      internal: [
        'Day 3 avg: 69 — pulled down by 8 new Beginner/Learner completions',
        'No Skilled employee regressed',
        'Retake cohort (+8 pts avg) began lifting scores again by Day 4',
      ],
      research: {
        text: 'Assessment rollouts typically show a temporary avg dip when late adopters complete — Nielsen Norman 2025.',
        citation: 'Nielsen Norman Group, 2025',
      },
      action: 'Normalize the dip in leadership comms; highlight retake gains as the leading indicator.',
      followUps: ['Which employees retook and improved the most?', 'At current pace when do we hit the sector benchmark?'],
    },
  },
  {
    match: q => q.includes('retook') || q.includes('improved'),
    response: {
      summary: `${LEADER_STATS.reengagersCount} employees retook and improved an average of +8 pts.`,
      internal: [
        'Employee 001: 71 → 78 (+7) · Employee 006: 58 → 67 (+9)',
        'Employee 012: 63 → 74 (+11) — largest single gain',
        'Retake rate peaks Day 3–4 of rollout',
      ],
      research: {
        text: 'Employees who retake within 5 days of first completion retain 3x more skills — internal rollout data.',
        citation: 'Obi Assessment Analytics, 2026',
      },
      action: 'Nudge the 35 non-returners with a personalized retake prompt.',
      followUps: ['What happens to our score if 20 more employees complete Do Now?', 'Generate a VP readiness brief'],
    },
  },
  {
    match: q =>
      q.includes('analyze') &&
      (q.includes('data') || q.includes('department') || q.includes('this week')),
    response: {
      summary: 'Top 3 actions: activate peer coaches, re-engage non-returners, and close the Discovery & Research readiness gap.',
      internal: [
        `1. ${LEADER_STATS.skilledPeerCoachCount} peer coaches ready — 40% faster transfer potential`,
        `2. ${LEADER_STATS.nonReengagedCount} employees not re-engaged — largest participation gap`,
        '3. 6 high-exposure / Beginner employees — highest strategic risk',
      ],
      research: {
        text: 'Combining internal rollout data with McKinsey 2025 and Microsoft Work Trend Index benchmarks.',
        citation: 'Multi-source: McKinsey · Microsoft · Obi 2026',
      },
      action: 'Execute all three in parallel this week; review progress in 7 days.',
      followUps: ['Generate a VP readiness brief', 'Who should I activate as peer coaches?'],
    },
  },
];

const MY_RESPONSES: { match: (q: string) => boolean; response: ObiResponse }[] = [
  {
    match: q => q.includes('this week') || q.includes('should i do'),
    response: {
      summary: 'This week: finish your Copilot on-ramp course and run one real workflow in Outlook.',
      internal: [
        '4 Do Now courses remaining — start with 32-min Copilot intro',
        'You are Day 5 of rollout; week-1 completers retain 3x more',
        'Copilot: 47 chats, 62nd percentile in department',
      ],
      research: {
        text: 'Early action within rollout week 1 correlates with +11 pt score lift.',
        citation: 'Obi Assessment Analytics, 2026',
      },
      action: 'Block 45 min Tuesday for the Copilot course; Thursday for one live Outlook draft.',
      followUps: ['What is my biggest skill gap right now?', 'How do I compare to others in my role?'],
    },
  },
  {
    match: q => q.includes('compare') || q.includes('others in my role'),
    response: {
      summary: 'You are above median readiness (78) for Senior PMs but below top quartile (85+).',
      internal: [
        'Your score: 78 · Role avg: 72 · Top quartile: 85+',
        'Copilot: 62nd percentile — top PMs average 70+ chats/quarter',
        'Gap to Familiar tier: ~7 pts',
      ],
      research: {
        text: 'Nielsen Norman 2025: PM prompting fluency is the primary differentiator at your level.',
        citation: 'Nielsen Norman Group, 2025',
      },
      action: 'Increase Copilot usage to 60+ chats this quarter to close the gap.',
      followUps: ['What is my biggest skill gap right now?', 'What should I do this week?'],
    },
  },
  {
    match: q => q.includes('skill gap') || q.includes('biggest gap'),
    response: {
      summary: 'Your biggest gap is Copilot prompting fluency — not foundational AI awareness.',
      internal: [
        'Readiness: Learner → target Familiar (7 pt gap)',
        'Role disruption 8.4/10 — high exposure, mid readiness',
        '4 Do Now courses incomplete',
      ],
      research: {
        text: 'Prompting and workflow integration matter more than theory at the Senior PM level.',
        citation: 'Nielsen Norman Group, 2025',
      },
      action: 'Complete Do Now courses in order; practice one prompt pattern per day in Copilot.',
      followUps: ['What should I do this week?', 'How do I compare to others in my role?'],
    },
  },
];

export function getObiResponse(query: string, mode: 'leader' | 'employee' = 'leader'): ObiResponse {
  const q = normalize(query);
  const map = mode === 'employee' ? MY_RESPONSES : RESPONSE_MAP;
  const found = map.find(r => r.match(q));
  if (found) return found.response;

  return {
    summary: 'I can help with readiness, benchmarks, risk, peer coaches, and reports — try a prompt from the menu above.',
    internal: [
      `${LEADER_STATS.uniqueCompletions} employees assessed · avg ${LEADER_STATS.avgScore}`,
      `${LEADER_STATS.reengagersCount} retook · ${LEADER_STATS.nonReengagedCount} not re-engaged`,
    ],
    research: {
      text: 'Obi merges your live assessment data with McKinsey, Microsoft, WEF, Harvard, and Nielsen Norman research.',
      citation: 'Obi Intelligence Engine',
    },
    action: 'Pick a category above or ask about scores, benchmarks, or peer coaching.',
    followUps: ['Where is our biggest strategic risk right now?', 'Generate a VP readiness brief'],
  };
}
