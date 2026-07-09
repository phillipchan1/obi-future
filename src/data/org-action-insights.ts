import {
  hasCompletedAssessment,
  LEADER_STATS,
  type EmployeeRecord,
} from './dashboard';
import {
  computeMetricsForDepartments,
  ORG_ROOT,
  type OrgNodeMetrics,
} from './org-tree';

export type ActionInsightCard = {
  id: string;
  badge: string;
  title: string;
  story: string;
  evidence: string[];
  recommendation: string;
  timing: string;
  impact: string;
  copilotTitle: string;
  copilotPrompt: string;
};

function skilledCount(metrics: OrgNodeMetrics): number {
  return metrics.levelDistribution.Skilled;
}

function beginnerLearnerCount(metrics: OrgNodeMetrics): number {
  return metrics.levelDistribution.Beginner + metrics.levelDistribution.Learner;
}

function topDeptByScore(employees: EmployeeRecord[]): { name: string; avg: number } | null {
  const depts = [...new Set(employees.map(e => e.department))];
  let best: { name: string; avg: number } | null = null;
  for (const name of depts) {
    const assessed = employees.filter(e => e.department === name && hasCompletedAssessment(e));
    if (assessed.length < 2) continue;
    const avg =
      Math.round(
        (assessed.reduce((s, e) => s + (e.finalScore ?? 0), 0) / assessed.length) * 10,
      ) / 10;
    if (!best || avg > best.avg) best = { name, avg };
  }
  return best;
}

function lowestDeptByScore(employees: EmployeeRecord[]): { name: string; avg: number } | null {
  const depts = [...new Set(employees.map(e => e.department))];
  let worst: { name: string; avg: number } | null = null;
  for (const name of depts) {
    const assessed = employees.filter(e => e.department === name && hasCompletedAssessment(e));
    if (assessed.length < 2) continue;
    const avg =
      Math.round(
        (assessed.reduce((s, e) => s + (e.finalScore ?? 0), 0) / assessed.length) * 10,
      ) / 10;
    if (!worst || avg < worst.avg) worst = { name, avg };
  }
  return worst;
}

function buildCopilotPrompt(params: {
  actionTitle: string;
  recommendation: string;
  evidence: string[];
  metrics: OrgNodeMetrics;
  scopeLabel: string;
}): string {
  const { actionTitle, recommendation, evidence, metrics, scopeLabel } = params;
  const dimLines = metrics.dimensions
    .map(d => `- ${d.label}: ${d.score100}/100`)
    .join('\n');

  return `I am an IT leader at ${ORG_ROOT.name} reviewing AI readiness for: ${scopeLabel}.

Help me plan this recommended move in detail:

Action: ${actionTitle}
Recommendation: ${recommendation}

Evidence from our readiness dashboard:
${evidence.map(e => `- ${e}`).join('\n')}

Current snapshot:
- People in scope: ${metrics.totalCount} (${metrics.assessedCount} assessed, ${metrics.participationPct}% participation)
- Group readiness: ${metrics.avgScore ?? '—'} / 100 (+${metrics.trendDelta} pts since last assessment)
- Levels: Skilled ${metrics.levelDistribution.Skilled}, Familiar ${metrics.levelDistribution.Familiar}, Learner ${metrics.levelDistribution.Learner}, Beginner ${metrics.levelDistribution.Beginner}
- Dimension scores:
${dimLines || '- (no assessed employees in scope)'}

Please produce:
1. A crisp executive one-pager of this action (why now, who, success metric).
2. A 30-day plan with weekly milestones and owners.
3. A kickoff agenda and invite list template.
4. Risks a VP might raise and how to answer them.
5. What to measure in Obi after 30 days to know it worked.`;
}

/** Derive executive "what do we do next" cards from the current selection. */
export function getOrgActionInsights(
  employees: EmployeeRecord[],
  departments: string[] | null,
  scopeLabel: string,
): ActionInsightCard[] {
  const metrics = computeMetricsForDepartments(departments);
  const assessed = employees.filter(hasCompletedAssessment);
  if (assessed.length === 0) return [];

  const skilled = skilledCount(metrics);
  const early = beginnerLearnerCount(metrics);
  const lowest = metrics.lowest;
  const strongest = metrics.strongest;
  const spread = metrics.largestSpread;
  const bright = topDeptByScore(employees);
  const lagging = lowestDeptByScore(employees);
  const avg = metrics.avgScore ?? LEADER_STATS.avgScore;

  const cards: ActionInsightCard[] = [];

  // 1. Vibeathon / peer build — when you have Skilled people and a scaling/workflow gap
  if (skilled >= 3) {
    const title = 'Host a 2-day AI Vibeathon';
    const evidence = [
      `${skilled} Skilled people in this view can coach peers hands-on`,
      lowest
        ? `${lowest.label} is the weakest dimension at ${lowest.score100}/100`
        : `Group readiness sits at ${avg}/100`,
      early > 0
        ? `${early} people still at Beginner/Learner — they need practice, not another slide deck`
        : 'Familiar band is ready to convert usage into workflow habits',
    ];
    const recommendation =
      'Pair Skilled builders with Learner/Beginner cohorts on real tickets for 48 hours. Ship 1–2 working Copilot agents or workflow demos per team.';
    cards.push({
      id: 'vibeathon',
      badge: 'Do now',
      title,
      story:
        'You already have enough skilled people to teach by doing. A short, high-energy build event turns readiness scores into shared muscle memory.',
      evidence,
      recommendation,
      timing: 'This month',
      impact: 'High',
      copilotTitle: title,
      copilotPrompt: buildCopilotPrompt({
        actionTitle: title,
        recommendation,
        evidence,
        metrics,
        scopeLabel,
      }),
    });
  }

  // 2. Close the lowest dimension gap
  if (lowest) {
    const title = `Run a ${lowest.label} sprint`;
    const evidence = [
      `${lowest.label} averages ${lowest.score100}/100 — lowest of the five dimensions`,
      strongest
        ? `${strongest.label} is already strong at ${strongest.score100}/100 — willingness isn't the blocker`
        : `Mindset and prompting typically outpace workflow adoption in this org`,
      `Participation is ${metrics.participationPct}% (${metrics.assessedCount} of ${metrics.totalCount}) — enough signal to act`,
    ];
    const recommendation = `Design a 3-week enablement sprint focused only on ${lowest.label}: live workflow labs, manager check-ins, and a before/after reassessment.`;
    cards.push({
      id: 'dimension-sprint',
      badge: 'Do now',
      title,
      story: `The data says people are bought in, but ${lowest.label.toLowerCase()} is where readiness stalls. Narrow the intervention to that one lever.`,
      evidence,
      recommendation,
      timing: 'Next 3 weeks',
      impact: 'High',
      copilotTitle: title,
      copilotPrompt: buildCopilotPrompt({
        actionTitle: title,
        recommendation,
        evidence,
        metrics,
        scopeLabel,
      }),
    });
  }

  // 3. Transfer playbook from bright spot to lagging pocket
  if (bright && lagging && bright.name !== lagging.name && bright.avg - lagging.avg >= 5) {
    const title = `Codify ${bright.name}'s playbook for ${lagging.name}`;
    const evidence = [
      `${bright.name} leads at ${bright.avg} avg readiness`,
      `${lagging.name} trails at ${lagging.avg} — a ${Math.round((bright.avg - lagging.avg) * 10) / 10}-pt gap`,
      spread
        ? `${spread.label} shows the widest person-to-person spread (${spread.spread100} pts) — coaching will land unevenly without a shared playbook`
        : 'Within-team spread means one-size training will miss half the room',
    ];
    const recommendation = `Interview 2–3 Skilled people in ${bright.name}, document their weekly Copilot rituals, and run a shadow-and-ship week with ${lagging.name}.`;
    cards.push({
      id: 'playbook-transfer',
      badge: 'Quick win',
      title,
      story:
        'Your brightest pocket has already solved something the rest of the org is stuck on. Capture it before it stays tribal knowledge.',
      evidence,
      recommendation,
      timing: 'Do later',
      impact: 'Med',
      copilotTitle: title,
      copilotPrompt: buildCopilotPrompt({
        actionTitle: title,
        recommendation,
        evidence,
        metrics,
        scopeLabel,
      }),
    });
  }

  // 4. Activate the Familiar band / nudge usage
  const familiar = metrics.levelDistribution.Familiar;
  if (familiar >= 3) {
    const title = 'Nudge the "knows-but-doesn\'t-use" Familiar band';
    const evidence = [
      `${familiar} Familiar employees are one habit away from Skilled`,
      `Skilled band is ${skilled} people — room to grow the top of the pyramid`,
      `Trend is +${metrics.trendDelta} pts since last assessment — momentum is there to convert`,
    ];
    const recommendation =
      'Skip another course. Ship weekly habit prompts (3 real work tasks in Copilot), manager shout-outs, and a 14-day usage challenge with a visible leaderboard.';
    cards.push({
      id: 'familiar-nudge',
      badge: 'Do later',
      title,
      story:
        'Familiar is your conversion zone — they understand AI but haven\'t made it a daily habit. Habit design beats curriculum here.',
      evidence,
      recommendation,
      timing: 'Next sprint',
      impact: 'Med',
      copilotTitle: title,
      copilotPrompt: buildCopilotPrompt({
        actionTitle: title,
        recommendation,
        evidence,
        metrics,
        scopeLabel,
      }),
    });
  }

  // Cap at 4 cards for executive scanability
  return cards.slice(0, 4);
}
