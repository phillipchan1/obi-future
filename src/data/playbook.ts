import { LEADER_STATS } from './dashboard';
import { getAtRiskEmployees, getPeerCoaches } from './briefing';

export type DraftedActionType = 'slack' | 'email' | 'memo';

export type PlaybookItem = {
  id: string;
  chipLabel: string;
  chipTone: 'lead' | 'momentum' | 'recovery' | 'narrative';
  situation: string;
  obiCall: string;
  drafted: {
    type: DraftedActionType;
    to: string;
    subject?: string;
    body: string;
  };
  slider: {
    label: string;
    options: { label: string; projection: string }[];
    defaultIndex: number;
  };
  evidence: {
    bullets: string[];
    sources: { label: string; meta: string }[];
  };
};

const atRisk = getAtRiskEmployees();
const coaches = getPeerCoaches();

export const OBI_READ_LINE =
  "Your org is in the top half of utility sector rollouts — and accelerating. Here's how to make this the quarter people notice.";

export const PLAYBOOK: PlaybookItem[] = [
  {
    id: 'highest-leverage',
    chipLabel: 'Top move this week',
    chipTone: 'lead',
    situation: `${atRisk.length} employees in your most AI-exposed roles, zero progress in 14 days.`,
    obiCall:
      "Pull them into a 30-minute peer cohort with Ali this week. This is the single highest-leverage move available to you right now.",
    drafted: {
      type: 'slack',
      to: 'Ali Khoury · L&D Partner',
      body: `Hey Ali — Obi flagged ${atRisk.length} of our Discovery & Research folks who haven't moved past Day 1. Could you run a 30-min cohort this Thursday? I'll send the invites. Worth doing while the rollout momentum is fresh.`,
    },
    slider: {
      label: 'How aggressive',
      options: [
        { label: 'Light nudge', projection: '~3 of 6 will re-engage' },
        { label: 'Peer cohort', projection: '~5 of 6 will re-engage · +14 readiness pts in 3 weeks' },
        { label: 'Manager mandate', projection: '6 of 6 attend · risk of resentment in 2-3 ICs' },
      ],
      defaultIndex: 1,
    },
    evidence: {
      bullets: [
        `Discovery & Research roles rated 92% AI-disrupted by McKinsey's 2025 utility sector analysis.`,
        `All 6 are at Beginner or Learner level — average gap of 31 pts vs role exposure.`,
        `Peer-led skill transfer outperforms instructor-led by 40% in enterprise settings (HBR 2024).`,
      ],
      sources: [
        { label: 'McKinsey', meta: 'Global Institute, 2025' },
        { label: 'HBR', meta: '2024 enterprise study' },
      ],
    },
  },
  {
    id: 'activate-coaches',
    chipLabel: 'Free win, sitting on the table',
    chipTone: 'momentum',
    situation: `${coaches.length} employees have reached Skilled level in roles that map directly to your lowest-readiness groups. None are activated.`,
    obiCall:
      "Pair each as a peer coach to one struggling cluster. Public recognition + light structure — they'll say yes, and it costs you nothing.",
    drafted: {
      type: 'email',
      to: '3 recipients · peer coach invitation',
      subject: "I'd like to put you in front of the team",
      body: `Hi — Obi surfaced your name as one of three people on the team who's hit Skilled-level AI readiness in a role with strong overlap to where others are stuck. Would you be open to running a 45-min "what's working for me" session for that group? Low prep — your real workflow is the curriculum. Happy to spotlight you in the next all-hands either way.`,
    },
    slider: {
      label: 'Format',
      options: [
        { label: 'Casual invite', projection: '2 of 3 likely to say yes' },
        { label: 'Formal pairing + spotlight', projection: '3 of 3 yes · +6 readiness pts org-wide in 4 weeks' },
        { label: 'Paid stipend program', projection: '3 of 3 yes · sustained 8-week lift · ~$4.5k cost' },
      ],
      defaultIndex: 1,
    },
    evidence: {
      bullets: [
        `Skilled-level employees identified: ${coaches.map(c => c.title).join(', ')}.`,
        `Each maps to a cluster currently averaging Beginner or Learner level.`,
        `Recognition-led volunteering has 78% acceptance vs 31% for cold asks (Nielsen Norman 2024).`,
      ],
      sources: [
        { label: 'HBR', meta: 'Peer learning, 2024' },
        { label: 'Nielsen Norman', meta: 'Recognition study, 2024' },
      ],
    },
  },
  {
    id: 'lock-momentum',
    chipLabel: 'Compound the momentum',
    chipTone: 'momentum',
    situation: `Your team gained ${LEADER_STATS.scoreGainInRollout} readiness pts in ${LEADER_STATS.rolloutDay} days — faster than typical cohort ramp.`,
    obiCall:
      "Lock the habit before it cools. A 7-day Copilot challenge — one prompt per day, posted in a public channel — turns this from a spike into a baseline.",
    drafted: {
      type: 'slack',
      to: '#it-team · channel announcement',
      body: `Team — quick experiment. Starting Monday, I'm running a 7-day Copilot challenge. One prompt a day, shared in #ai-wins. No grading, no obligation. Goal: turn what we've started into the way we work. I'll go first. Who's in?`,
    },
    slider: {
      label: 'Scope',
      options: [
        { label: 'Opt-in', projection: '~12 participants · low risk' },
        { label: 'Manager-nominated', projection: '~30 participants · +9 pts forecasted' },
        { label: 'Department-wide', projection: '53 participants · +14 pts · some fatigue risk' },
      ],
      defaultIndex: 1,
    },
    evidence: {
      bullets: [
        `Top-quartile utility orgs maintain 70+ Copilot chats/quarter; your median is ${LEADER_STATS.medianCopilotUsage}.`,
        `Top users see 2x productivity benefit within 6 months (Microsoft WTI 2025).`,
        `Habit formation in week 2-3 is the threshold — momentum stalls without reinforcement.`,
      ],
      sources: [{ label: 'Microsoft', meta: 'Work Trend Index, 2025' }],
    },
  },
  {
    id: 'recover-lapsed',
    chipLabel: 'Quiet recovery play',
    chipTone: 'recovery',
    situation: `${LEADER_STATS.nonReengagedCount} employees haven't returned since Day 1 — but 23 of them are within 5 pts of the next readiness level.`,
    obiCall:
      "A personalized 'you're closer than you think' nudge converts the strongest. Don't blast everyone — target the 23 on the threshold.",
    drafted: {
      type: 'email',
      to: '23 recipients · merge-tagged',
      subject: "You're 4 points from {{nextLevel}}",
      body: `Hey {{firstName}} — quick note from me, not the system. You scored {{score}} on the readiness check. You're {{gap}} pts from {{nextLevel}}, and the path there is one Do Now course. No pressure — just didn't want you to miss how close you are.`,
    },
    slider: {
      label: 'Channel',
      options: [
        { label: 'Quiet email only', projection: '~6 of 23 convert' },
        { label: 'Email + manager ping', projection: '~12 of 23 convert' },
        { label: 'Skip-level outreach', projection: '~17 of 23 convert · higher org friction' },
      ],
      defaultIndex: 0,
    },
    evidence: {
      bullets: [
        `Threshold-targeted nudges convert 3-5x higher than broad re-engagement campaigns.`,
        `Your re-engagement rate (${LEADER_STATS.reengagementRatePct}%) is already above the utility sector median.`,
        `These 23 are not disengaged — they're idle. The distinction matters.`,
      ],
      sources: [{ label: 'Nielsen Norman', meta: 'Re-engagement patterns, 2024' }],
    },
  },
  {
    id: 'narrate-up',
    chipLabel: 'Make your leadership visible',
    chipTone: 'narrative',
    situation: `QBR in two weeks. You have a real story: above-sector trajectory, ${LEADER_STATS.uniqueCompletions} employees assessed, ${LEADER_STATS.scoreGainInRollout}-pt gain in week one.`,
    obiCall:
      "Don't let this read as a status update. Frame it as 'here's how we're closing the gap with the top quartile' and put a number on the next 90 days.",
    drafted: {
      type: 'memo',
      to: 'Leadership team · 1-page brief',
      subject: 'AI readiness: where we are, where we go next',
      body: `Headline: Our org is closing the gap with top-quartile utility peers faster than the sector average — and three deliberate moves over the next 90 days will hold the trajectory. (1) Activate 3 peer coaches identified by Obi. (2) Convert week-one momentum into habit via a Copilot challenge. (3) Re-engage the 23 employees who are within striking distance of the next readiness tier. Forecast: benchmark parity in ~11 weeks at current pace.`,
    },
    slider: {
      label: 'Format',
      options: [
        { label: 'Verbal update', projection: 'lowest effort · easiest to forget' },
        { label: '1-page memo', projection: 'readable in 90 seconds · circulates' },
        { label: 'Board-quality slide', projection: 'travels to CEO · sets the benchmark you commit to' },
      ],
      defaultIndex: 1,
    },
    evidence: {
      bullets: [
        `Your trajectory is +${LEADER_STATS.scoreGainInRollout} pts in ${LEADER_STATS.rolloutDay} days, above sector ramp rate.`,
        `Gap to top-quartile benchmark: ${LEADER_STATS.topQuartileBenchmark - LEADER_STATS.avgScore} pts.`,
        `At current pace, parity in ~11 weeks — a number worth committing to in the room.`,
      ],
      sources: [{ label: 'Microsoft', meta: 'Work Trend Index, 2025' }],
    },
  },
];
