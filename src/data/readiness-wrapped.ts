/** Demo org seed — single source of truth for Readiness Wrapped prototype */

export const ORG = {
  name: 'Digital and Process Transformation',
  leader: 'Tricia',
  peopleInScope: 55,
  departmentsCount: 6,
  assessed: 34,
  readinessAvg: 71,
  bands: { Beginner: [1, 30], Learner: [31, 55], Familiar: [56, 75], Skilled: [76, 100] },
  levels: { Skilled: 10, Familiar: 12, Learner: 9, Beginner: 3 },
  dimensions: [
    { name: 'Mindset & Comfort', v: 4.1 },
    { name: 'Prompting Skill', v: 3.5 },
    { name: 'Workflow Impact', v: 3.2 },
    { name: 'Usage Frequency', v: 3 },
    { name: 'Scaling & Enablement', v: 2.6, weakest: true },
  ],
  departments: [
    { name: 'Digital Transformation', score: 82, n: 9, note: 'edge is specifically their Scaling score' },
    { name: 'Process Transformation', score: 76, n: 8 },
    { name: 'Automation & AI Enablement', score: 72, n: 6 },
    { name: 'Data & Insights', score: 68, n: 5 },
    { name: 'Change Enablement', score: 61, n: 4 },
    { name: 'Portfolio Operations', score: 54, n: 2 },
  ],
  copilot: {
    licensed: 42,
    active: 27,
    dormant: 15,
    unlicensed: 13,
    agents: 8,
    builders: 4,
    skilledChatsPerQtr: 22,
    beginnerChatsPerQtr: 3,
  },
  roles: {
    top: [
      { name: 'Program Manager', n: 7 },
      { name: 'Business Process Analyst', n: 6 },
      { name: 'Product Manager', n: 4 },
      { name: 'Data Analyst', n: 3 },
      { name: 'Change Manager', n: 3 },
      { name: 'Automation Specialist', n: 2 },
      { name: 'UX Designer', n: 1 },
      { name: 'Solutions Architect', n: 1 },
    ],
    tailRoles: 5,
    tailPeople: 7,
    analystClusterPeople: 9,
  },
} as const;

export type Confidence = 'Measured' | 'Estimated' | 'Directional';

export type InsightCard = {
  id: string;
  title: string;
  body: string;
  confidence: Confidence;
  footnote?: string;
  variant?: 'default' | 'copilot-handoff';
};

export type ActionCard = {
  id: string;
  title: string;
  description: string;
  why: string;
  evidence: string[];
  timing: string;
  impact: string;
  effort: string;
  provenance: string;
};

export const coveragePct = Math.round((ORG.assessed / ORG.peopleInScope) * 100);
export const dormantLicensePct = Math.round((ORG.copilot.dormant / ORG.copilot.licensed) * 100);
export const learnerOrBelow = ORG.levels.Learner + ORG.levels.Beginner;
export const topFiveRolesPeople = ORG.roles.top.slice(0, 5).reduce((s, r) => s + r.n, 0);

export const COPILOT_USAGE_MODEL = {
  assumptions: {
    avgMinutesSavedPerChat: 6,
    avgHoursSavedPerAgentPerMonth: 2.5,
    beginnerActivationTargetChatsPerQtr: 8,
  },
  readinessUsage: [
    { level: 'Skilled', people: ORG.levels.Skilled, chatsPerQtr: ORG.copilot.skilledChatsPerQtr },
    { level: 'Familiar', people: ORG.levels.Familiar, chatsPerQtr: 12 },
    { level: 'Learner', people: ORG.levels.Learner, chatsPerQtr: 6 },
    { level: 'Beginner', people: ORG.levels.Beginner, chatsPerQtr: ORG.copilot.beginnerChatsPerQtr },
  ],
} as const;

export const estimatedQuarterlyChats = COPILOT_USAGE_MODEL.readinessUsage.reduce(
  (sum, row) => sum + row.people * row.chatsPerQtr,
  0,
);
export const estimatedQuarterlyChatHoursSaved = Math.round(
  (estimatedQuarterlyChats * COPILOT_USAGE_MODEL.assumptions.avgMinutesSavedPerChat) / 60,
);
export const estimatedMonthlyAgentHoursSaved = Math.round(
  ORG.copilot.agents * COPILOT_USAGE_MODEL.assumptions.avgHoursSavedPerAgentPerMonth,
);
export const estimatedQuarterlyAgentHoursSaved = Math.round(
  ORG.copilot.agents * COPILOT_USAGE_MODEL.assumptions.avgHoursSavedPerAgentPerMonth * 3,
);
export const estimatedQuarterlyHoursSaved =
  estimatedQuarterlyChatHoursSaved + estimatedQuarterlyAgentHoursSaved;
export const skilledUsageMultiplier = Math.round(
  ORG.copilot.skilledChatsPerQtr / ORG.copilot.beginnerChatsPerQtr,
);
export const aiMaximizationPct = Math.round(
  (ORG.copilot.active / ORG.copilot.licensed) * (ORG.readinessAvg / 100) * 100,
);

export const QUESTION_TRACKER = [
  { label: 'Where are my people?', sceneIndex: 1 },
  { label: 'How are they progressing?', sceneIndex: 2 },
  { label: 'What actions should we take?', sceneIndex: 3 },
] as const;

export const SCENE_COUNT = 4;

export const SCENE_META = [
  { id: 'cover', trackerIndex: -1, accent: 'neutral' as const },
  { id: 'where', trackerIndex: 0, accent: 'cool' as const },
  { id: 'doing', trackerIndex: 1, accent: 'warm' as const },
  { id: 'plan', trackerIndex: 2, accent: 'success' as const },
];

export const SCENE1_INSIGHTS: InsightCard[] = [
  {
    id: 's1-shape',
    title: 'The shape read',
    confidence: 'Estimated',
    body: "Your people are bought in (Mindset 4.1) but can't spread wins (Scaling 2.6). The gap isn't willingness — it's enablement.",
    footnote: 'Self-reported, firms up under v2 scoring.',
  },
  {
    id: 's1-spread',
    title: "It's a spread problem, not an average",
    confidence: 'Measured',
    body: 'A cluster of 10 Skilled pulls the mean up while 12 sit at Learner or below. The 71 hides two very different populations.',
  },
  {
    id: 's1-bright',
    title: 'Your bright spot',
    confidence: 'Measured',
    body: "Digital Transformation leads at 82 — and it's their Scaling score that separates them. They've cracked the exact thing everyone else is stuck on.",
    footnote: 'Remember this — it pays off in the game plan.',
  },
];

export const SCENE2_INSIGHTS: InsightCard[] = [
  {
    id: 's2-waste',
    title: 'License waste',
    confidence: 'Measured',
    body: '15 people hold a Copilot license but show near-zero usage — 36% of paid seats idle. A budget line you can act on today.',
  },
  {
    id: 's2-lever',
    title: 'Usage is the lever',
    confidence: 'Measured',
    body: 'Skilled users average 22 chats/quarter; Beginners average 3 — roughly 7x more usage. Engagement and readiness move together, so usage is the adoption signal to manage.',
  },
  {
    id: 's2-builders',
    title: 'Your 4 builders',
    confidence: 'Estimated',
    body: '4 people have built 8 agents. At a conservative 2.5 hours saved per agent per month, that is about 60 hours/quarter before broader rollout.',
    footnote: 'Estimated from prototype assumptions; the builder count is measured.',
  },
  {
    id: 's2-maximization',
    title: 'AI maximization gap',
    confidence: 'Estimated',
    body: 'Your current AI Maximization signal is 46%: active-license rate multiplied by readiness average. The gap is not tool access alone — it is readiness converting into repeat usage.',
    footnote: 'Prototype index: active licensed users × readiness average.',
  },
];

export const SCENE3_INSIGHTS: InsightCard[] = [
  {
    id: 's3-concentration',
    title: 'Concentrated, not sprawling',
    confidence: 'Measured',
    body: 'Your top 5 roles cover most of your assessed people; a long tail of 5 roles makes up the rest. Concentration means enablement can be targeted.',
  },
  {
    id: 's3-analyst',
    title: 'An analyst-heavy core',
    confidence: 'Measured',
    body: 'Business Process and Data Analysts are your largest analytical cluster — 9 people doing knowledge- and language-heavy work.',
  },
  {
    id: 's3-copilot',
    title: 'How are these roles changing?',
    confidence: 'Directional',
    body: 'Obi shows the shape of the work today and hands the forward-looking exploration to Copilot — exploratory, not a forecast Obi is asserting.',
    variant: 'copilot-handoff',
  },
];

export const ACTION_CARDS: ActionCard[] = [
  {
    id: 'a1',
    title: 'Launch peer-led scaling sprints',
    description: 'Connect the 4 builders to teams stuck on scaling.',
    why: 'This is the highest-leverage bridge between readiness and repeatable adoption.',
    evidence: [
      'Scaling & Enablement is the weakest dimension at 2.6/5',
      'Digital Transformation leads at 82 and is strongest on scaling',
      '4 builders have already created 8 agents',
    ],
    timing: 'Do now',
    impact: 'High impact',
    effort: 'Med effort',
    provenance: 'from §1 + §2',
  },
  {
    id: 'a2',
    title: 'Reclaim 15 dormant licenses',
    description: 'Activation push + reallocate cold seats.',
    why: 'Paid access is not converting into usage, so this is the fastest operational unlock.',
    evidence: [
      '15 of 42 licensed seats are dormant',
      '36% of paid seats show near-zero usage',
      'AI Maximization is only 46% despite readiness avg 71',
    ],
    timing: 'Do now',
    impact: 'High',
    effort: 'Low',
    provenance: 'from §2',
  },
  {
    id: 'a3',
    title: 'Focus enablement on your biggest cluster',
    description: 'Analysts (9 people), most leverage per program.',
    why: 'A targeted program beats broad enablement because the work is concentrated.',
    evidence: [
      'Business Process and Data Analysts total 9 people',
      'Top 5 roles cover 23 assessed people',
      'Analyst work is knowledge- and language-heavy',
    ],
    timing: 'Do now',
    impact: 'High',
    effort: 'Med',
    provenance: 'from workforce mix',
  },
  {
    id: 'a4',
    title: "Codify Digital Transformation's playbook",
    description: 'Document what makes their scaling work; make it repeatable.',
    why: 'The strongest team appears to have solved the org-wide bottleneck.',
    evidence: [
      'Digital Transformation readiness is 82 vs org avg 71',
      'Their edge is specifically the Scaling score',
      'Scaling is the org’s weakest dimension at 2.6/5',
    ],
    timing: 'Do later',
    impact: 'Med',
    effort: 'Med',
    provenance: 'from §1',
  },
  {
    id: 'a5',
    title: 'Nudge the "knows-but-doesn\'t-use" group',
    description: 'High readiness, low usage; habit prompts, not courses.',
    why: 'The usage gap suggests some people know what AI is but have not made it a work habit.',
    evidence: [
      'Skilled users average 22 chats/qtr vs Beginners at 3',
      'Usage Frequency trails Mindset: 3.0 vs 4.1',
      '12 Familiar users are close to higher leverage',
    ],
    timing: 'Do later',
    impact: 'Med',
    effort: 'Low',
    provenance: 'from §2',
  },
  {
    id: 'a6',
    title: 'Close the assessment gap',
    description: 'Reading 34 of 55; push completion for a whole-team picture.',
    why: 'The story is directional until more of the org is represented.',
    evidence: [
      '34 of 55 people assessed',
      '62% current coverage',
      'Momentum tracking unlocks after reassessments accrue',
    ],
    timing: 'Do later',
    impact: 'Foundational',
    effort: '—',
    provenance: 'from §1',
  },
];

export const FOLLOW_UP_QUESTIONS: Record<string, string[]> = {
  's1-shape': [
    'Which teams are weakest on Scaling?',
    'What would move the Scaling score fastest?',
    "Who's already strong on Scaling?",
  ],
  's1-spread': [
    'Show readiness distribution by team.',
    'Which teams have the widest internal spread?',
    'How many people are one band from Skilled?',
  ],
  's1-bright': [
    "What makes Digital Transformation's Scaling score higher?",
    'Which Digital Transformation practices could transfer?',
    'Compare Digital Transformation to the org average by dimension.',
  ],
  's2-waste': [
    'Which teams have the most idle licenses?',
    "Who's licensed but inactive?",
    "What's the annual cost of the dormant seats?",
  ],
  's2-lever': [
    'Show usage vs readiness by person.',
    'Which active users are still scoring low?',
    'What usage level predicts Skilled?',
  ],
  's2-builders': [
    'Who are the 4 builders?',
    'Which teams have no builders?',
    'What have the builders automated?',
  ],
  's2-maximization': [
    'How is maximization calculated?',
    'What would lift the score fastest?',
    'Where is readiness not turning into usage?',
  ],
  's3-concentration': [
    'List all 13 roles by headcount.',
    'Which roles are in the long tail?',
    'How concentrated is each team?',
  ],
  's3-analyst': [
    'Break down the analyst roles by team.',
    "What's the readiness of analyst roles?",
    'Which analyst group is largest?',
  ],
  a1: ['How would I start this?', 'Who should own it?', "What's the expected impact?"],
  a2: ['How would I start this?', 'Who should own it?', "What's the expected impact?"],
  a3: ['How would I start this?', 'Who should own it?', "What's the expected impact?"],
  a4: ['How would I start this?', 'Who should own it?', "What's the expected impact?"],
  a5: ['How would I start this?', 'Who should own it?', "What's the expected impact?"],
  a6: ['How would I start this?', 'Who should own it?', "What's the expected impact?"],
};

export const GENERAL_ASK_OBI_QUESTIONS = [
  'Which team needs the most help?',
  "Where's my biggest quick win?",
  'Summarize the top risk in one line.',
];

export const COPILOT_HANDOFF_PROMPT =
  "Here's the role composition of my team (Digital and Process Transformation, 34 assessed people across 13 roles): Program Manager (7), Business Process Analyst (6), Product Manager (4), Data Analyst (3), Change Manager (3), Automation Specialist (2), UX Designer (1), Solutions Architect (1), plus 5 other roles (7 people). How are these roles likely to change as AI tools mature over the next 1–2 years? For each major group, which tasks are most likely to shift, and what skills should they build?";

export function buildActionCopilotPrompt(action: ActionCard): string {
  return `I am an enterprise leader reviewing my AI readiness dashboard for ${ORG.name}. Help me brainstorm and pressure-test this recommended move:

Recommended move: ${action.title}
Description: ${action.description}
Timing / effort / impact: ${action.timing}; ${action.impact}; ${action.effort}

Why the dashboard recommends it:
${action.evidence.map(point => `- ${point}`).join('\n')}

Relevant org data:
- ${ORG.peopleInScope} people in scope; ${ORG.assessed} assessed (${coveragePct}% coverage)
- Average readiness: ${ORG.readinessAvg}/100
- Readiness levels: Skilled ${ORG.levels.Skilled}, Familiar ${ORG.levels.Familiar}, Learner ${ORG.levels.Learner}, Beginner ${ORG.levels.Beginner}
- Weakest readiness dimension: Scaling & Enablement at 2.6/5
- Strongest team signal: ${ORG.departments[0].name} readiness ${ORG.departments[0].score}; their edge is scaling
- Copilot: ${ORG.copilot.licensed} licensed, ${ORG.copilot.active} active, ${ORG.copilot.dormant} dormant, ${ORG.copilot.unlicensed} unlicensed
- Builder signal: ${ORG.copilot.builders} builders have created ${ORG.copilot.agents} agents
- AI Maximization signal: ${aiMaximizationPct}% (active-license rate multiplied by readiness average)
- Role concentration: top 5 roles cover ${topFiveRolesPeople} assessed people; analyst cluster is ${ORG.roles.analystClusterPeople} people

Please produce:
1. A sharper version of this recommendation in executive language.
2. A 30-day pilot plan with owner, target audience, weekly milestones, and success metrics.
3. Risks or objections a VP might raise and how to answer them.
4. What data I should ask Obi or my analytics team for next before scaling this.`;
}

export const OBI_SYSTEM_GROUNDING =
  'You are Obi, an AI-readiness analyst embedded in a leader dashboard. Answer using ONLY the provided data. Be concise (2–4 sentences), specific, cite numbers. If the data doesn\'t contain the answer, say what\'s needed. Don\'t invent figures.';

export function serializeOrgForGrounding(): string {
  return JSON.stringify(ORG, null, 2);
}

/** Level distribution for charts */
export const LEVEL_CHART_DATA = [
  { name: 'Skilled', value: ORG.levels.Skilled, color: '#3A3A3C' },
  { name: 'Familiar', value: ORG.levels.Familiar, color: '#AEAEB2' },
  { name: 'Learner', value: ORG.levels.Learner, color: '#C4C9D0' },
  { name: 'Beginner', value: ORG.levels.Beginner, color: '#E5E5EA' },
] as const;

export const LICENSE_BAR_SEGMENTS = [
  { label: 'Active', value: ORG.copilot.active, color: '#16A34A' },
  { label: 'Idle', value: ORG.copilot.dormant, color: '#EA580C' },
  { label: 'Unlicensed', value: ORG.copilot.unlicensed, color: '#E5E7EB' },
] as const;
