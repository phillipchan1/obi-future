import {
  ORG,
  aiMaximizationPct,
  coveragePct,
  dormantLicensePct,
  estimatedMonthlyAgentHoursSaved,
  estimatedQuarterlyAgentHoursSaved,
  estimatedQuarterlyChatHoursSaved,
  estimatedQuarterlyHoursSaved,
  learnerOrBelow,
  skilledUsageMultiplier,
} from '../../../../data/readiness-wrapped';

type AnswerInput = {
  question: string;
  context: string;
};

type AnswerRule = {
  matches: (input: AnswerInput) => boolean;
  answer: (input: AnswerInput) => string;
};

function includesAny(value: string, terms: string[]): boolean {
  return terms.some(term => value.includes(term));
}

const ANSWER_RULES: AnswerRule[] = [
  {
    matches: ({ question }) =>
      includesAny(question, ['department', 'team']) && includesAny(question, ['weak', 'help', 'most']),
    answer: () => {
      const weakest = [...ORG.departments].sort((a, b) => a.score - b.score)[0];
      const nextLowest = [...ORG.departments].sort((a, b) => a.score - b.score)[1];
      return `${weakest.name} scores lowest at ${weakest.score} (${weakest.n} people assessed). ${nextLowest.name} is also below the org average at ${nextLowest.score}. ${ORG.departments[0].name} leads at ${ORG.departments[0].score}.`;
    },
  },
  {
    matches: ({ question }) => includesAny(question, ['quick win', 'biggest quick']),
    answer: () =>
      `Reclaim ${ORG.copilot.dormant} dormant licenses (${dormantLicensePct}% of paid seats) — activation is low effort with high budget impact. Pair with a nudge to the ${ORG.levels.Familiar} Familiar users who score high but use Copilot infrequently.`,
  },
  {
    matches: ({ question }) => includesAny(question, ['top risk', 'summarize']),
    answer: () =>
      `This group averages ${ORG.readinessAvg} readiness, but Scaling & Enablement sits at 2.6/5 while Mindset is 4.1 — people are willing but can't spread wins. Meanwhile ${dormantLicensePct}% of Copilot licenses (${ORG.copilot.dormant} seats) are idle.`,
  },
  {
    matches: ({ question, context }) => question.includes('scaling') || context.includes('shape read'),
    answer: () =>
      `Scaling & Enablement is the weakest dimension at 2.6/5 across the group. ${ORG.departments[0].name} (${ORG.departments[0].score}) is the bright spot — their scaling practices separate them from the ${ORG.readinessAvg} average. Mindset (${ORG.dimensions[0].v}) shows willingness isn't the blocker.`,
  },
  {
    matches: ({ question, context }) =>
      includesAny(question, ['distribution', 'spread']) || context.includes('spread'),
    answer: () =>
      `${ORG.levels.Skilled} Skilled, ${ORG.levels.Familiar} Familiar, ${ORG.levels.Learner} Learner, and ${ORG.levels.Beginner} Beginner (${ORG.assessed} assessed). ${learnerOrBelow} people sit at Learner or below while ${ORG.levels.Skilled} Skilled pull the ${ORG.readinessAvg} average up.`,
  },
  {
    matches: ({ question, context }) =>
      includesAny(question, ['engineering', 'digital transformation']) || context.includes('bright spot'),
    answer: () =>
      `${ORG.departments[0].name} leads at ${ORG.departments[0].score} with ${ORG.departments[0].n} people assessed. Their edge is specifically scaling — the same capability stuck at 2.6 across the group. ${ORG.copilot.builders} builders (of ${ORG.copilot.agents} agents) concentrate here.`,
  },
  {
    matches: ({ question, context }) =>
      includesAny(question, ['idle', 'dormant', 'license']) || context.includes('license waste'),
    answer: () =>
      `${ORG.copilot.dormant} people hold licenses with near-zero usage — ${dormantLicensePct}% of ${ORG.copilot.licensed} paid seats. ${ORG.copilot.active} are active and ${ORG.copilot.unlicensed} remain unlicensed across ${ORG.peopleInScope} in scope.`,
  },
  {
    matches: ({ question, context }) =>
      includesAny(question, ['maximization', 'maximizing']) || context.includes('maximization'),
    answer: () =>
      `The prototype AI Maximization signal is ${aiMaximizationPct}%: active-license rate multiplied by readiness average (${ORG.readinessAvg}). It says adoption is not just access — ${ORG.copilot.active} active users are converting readiness into usage, while ${ORG.copilot.dormant} dormant licensed users are not.`,
  },
  {
    matches: ({ question }) => includesAny(question, ['time', 'saved', 'hours']),
    answer: () =>
      `The estimate is ${estimatedQuarterlyHoursSaved} hours saved per quarter: ${estimatedQuarterlyChatHoursSaved} from Copilot chats plus ${estimatedQuarterlyAgentHoursSaved} from agents. The agent estimate assumes ${ORG.copilot.agents} agents save about ${estimatedMonthlyAgentHoursSaved} hours per month in total.`,
  },
  {
    matches: ({ question, context }) =>
      includesAny(question, ['usage', 'chats']) || context.includes('lever'),
    answer: () =>
      `Skilled users average ${ORG.copilot.skilledChatsPerQtr} chats/quarter vs ${ORG.copilot.beginnerChatsPerQtr} for Beginners, about ${skilledUsageMultiplier}x more. Engagement and readiness move together — ${ORG.copilot.active} active users vs ${ORG.copilot.dormant} dormant.`,
  },
  {
    matches: ({ question, context }) =>
      question.includes('builder') || context.includes(`${ORG.copilot.builders} builders`),
    answer: () =>
      `${ORG.copilot.builders} people have built ${ORG.copilot.agents} agents — concentrated in ${ORG.departments[0].name}. At the prototype assumption of 2.5 hours saved per agent per month, that is about ${estimatedQuarterlyAgentHoursSaved} hours per quarter. They're your multipliers for peer-led scaling sprints across teams stuck on enablement.`,
  },
  {
    matches: ({ question, context }) =>
      includesAny(question, ['role', 'analyst']) ||
      context.includes('concentrated') ||
      context.includes('analyst'),
    answer: () => {
      const top = ORG.roles.top.slice(0, 3).map(r => `${r.name} (${r.n})`).join(', ');
      return `${ORG.roles.top.length + ORG.roles.tailRoles} distinct roles across ${ORG.assessed} assessed. Top roles: ${top}. Analyst cluster (Business Process + Data) = ${ORG.roles.analystClusterPeople} people. Long tail: ${ORG.roles.tailRoles} roles, ${ORG.roles.tailPeople} people.`;
    },
  },
  {
    matches: ({ question }) => includesAny(question, ['assessment', 'gap', '55']),
    answer: () =>
      `You've assessed ${ORG.assessed} of ${ORG.peopleInScope} people (${coveragePct}% coverage) across ${ORG.departmentsCount} teams. Closing the gap unlocks whole-team momentum tracking on reassessment.`,
  },
  {
    matches: ({ question }) => question.includes('cost') && question.includes('dormant'),
    answer: () =>
      `The data includes ${ORG.copilot.dormant} dormant seats (${dormantLicensePct}% of ${ORG.copilot.licensed} licenses) but not per-seat pricing. To estimate annual cost, multiply dormant count by your Copilot license rate.`,
  },
];

function actionAnswer(input: AnswerInput): string | null {
  if (!includesAny(input.question, ['start', 'own', 'impact'])) return null;

  if (input.context.includes('scaling sprint') || input.question.includes('scaling')) {
    return `Start by pairing ${ORG.copilot.builders} builders with 2–3 teams scoring below ${ORG.readinessAvg} on scaling. ${ORG.departments[0].name} can host a 2-week sprint; expect measurable lift in Scaling & Enablement (currently 2.6). Owner: Tricia's leadership team + AI CoE.`;
  }

  if (input.context.includes('dormant') || input.question.includes('reclaim')) {
    return `Run a 30-day activation campaign targeting ${ORG.copilot.dormant} dormant license holders. Reallocate unresponsive seats after 60 days. Owner: Tricia's leadership team + team leads. High impact, low effort — direct budget recovery.`;
  }

  if (input.context.includes('analyst') || input.question.includes('cluster')) {
    return `Design one enablement program for the ${ORG.roles.analystClusterPeople}-person analyst cluster (Business Process and Data analysts). Highest leverage per program dollar. Owner: Process Transformation or Data & Insights lead.`;
  }

  return `Ground the move in your seed data: ${ORG.assessed} assessed at avg ${ORG.readinessAvg}, ${ORG.copilot.dormant} dormant licenses, ${ORG.copilot.builders} builders. Pick the owner closest to the affected population and set a 30-day checkpoint.`;
}

/** Stub grounded answers for prototype — no LLM */
export function getObiStubAnswer(question: string, cardTitle?: string): string {
  const q = question.toLowerCase();
  const ctx = cardTitle?.toLowerCase() ?? '';
  const input = { question: q, context: ctx };
  const action = actionAnswer(input);
  if (action) return action;

  const rule = ANSWER_RULES.find(candidate => candidate.matches(input));
  if (rule) return rule.answer(input);

  return `Across ${ORG.name}: ${ORG.assessed} assessed (${coveragePct}% of ${ORG.peopleInScope}), readiness avg ${ORG.readinessAvg}, Scaling at 2.6/5, ${ORG.copilot.dormant} dormant licenses. Ask a more specific follow-up and I'll cite the relevant slice.`;
}
