import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Bot, ChevronLeft, ChevronRight, ChevronDown, Clock, Play, Youtube,
  ExternalLink, Flame, AlertCircle, Check, Users, BookOpen,
  Calendar, Zap, MessageSquare, TrendingUp, Timer,
  Key, Lock, Sparkles, Mail, FileText, Presentation,
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

const PERSONA = {
  name: 'Phil Chan',
  role: 'Senior Product Manager',
  aiLevel: 'Learner' as const,
  targetLevel: 'Familiar' as const,
  exposureScore: 8.4,
};

const PRIORITIES = [
  {
    num: '01',
    title: 'Think WITH AI, not just through it',
    desc: 'Before your next big strategy call, spend 5 minutes running it by an AI. Use it to surface blind spots, challenge your framing, and pressure-test assumptions before you commit.',
    whyNow: 'PMs who treat AI as a sparring partner — not just a search box — make sharper calls in strategy reviews and exec conversations. This is the mindset shift that changes how you show up in the room.',
  },
  {
    num: '02',
    title: 'Supercharge your research synthesis',
    desc: "You're sitting on a goldmine of qualitative data. AI turns 40 interview transcripts into structured themes in under 30 minutes — freeing you to focus on the 'so what.'",
    whyNow: 'Discovery is still the core of PM work — but the bottleneck moved from "reading everything" to "synthesizing fast." This idea reshapes how much signal you bring to every prioritization conversation.',
  },
  {
    num: '03',
    title: 'Ship sharper artifacts, faster',
    desc: 'PRDs, one-pagers, stakeholder updates, release notes — all perfect AI draft candidates. Build one strong prompt template this week. Save 2+ hours every time you use it.',
    whyNow: 'Your written output is how stakeholders experience your judgment. AI doesn\'t replace that — it multiplies your throughput so you spend time on framing and decisions, not blank pages.',
  },
  {
    num: '04',
    title: 'Develop your AI product instinct',
    desc: "Your competitors are building AI into their products. You'll be making build/buy/partner decisions about AI. Understand what it can and can't do — your credibility depends on it.",
    whyNow: 'The PM role is splitting: operators who use AI for tasks, and leaders who shape AI-powered products. This idea is what keeps you credible when roadmap conversations turn to "what should we build with AI?"',
  },
];

const WEEKLY_PLAN = [
  {
    id: 'w1',
    week: 'Week 1',
    action: 'Install Copilot and connect it to Teams, Outlook, and Word',
    whyDev: 'You can\'t reach Familiar without the tools in your daily environment. Setup week removes friction so every later step happens in real workflows, not a sandbox.',
  },
  {
    id: 'w2',
    week: 'Week 2',
    action: 'Complete your 4 core foundational courses (all under 35 min each)',
    whyDev: 'Learners who skip foundations plateau early. These four courses give you shared vocabulary and guardrails — the baseline Familiar PMs build on.',
  },
  {
    id: 'w3',
    week: 'Week 3',
    action: 'Use Copilot to summarize a real meeting or draft a stakeholder email',
    whyDev: 'First real-world use is the inflection point. One meeting summary or email draft proves AI fits your rhythm — that\'s the shift from Learner to practicing Familiar.',
  },
  {
    id: 'w4',
    week: 'Week 4',
    action: 'Write your first AI-assisted PRD or strategy one-pager',
    whyDev: 'Familiar fluency shows up in artifacts stakeholders actually read. Drafting a PRD with AI teaches you where to trust the output and where to edit — a core PM skill.',
  },
  {
    id: 'w5',
    week: 'Week 5',
    action: 'Run an AI research synthesis session on real interview or survey data',
    whyDev: 'This is the highest-ROI skill for your role. Synthesizing real research with AI is what separates PMs who "use Copilot sometimes" from those operating at Familiar level.',
  },
  {
    id: 'w6',
    week: 'Week 6',
    action: "Use AI to stress-test your current roadmap — look for gaps you've missed",
    whyDev: 'Strategic use of AI — not just tactical — is a Familiar hallmark. Stress-testing your roadmap builds judgment about when AI augments thinking vs. when it misleads.',
  },
  {
    id: 'w7',
    week: 'Week 7',
    action: 'Teach one AI workflow to your team or a peer — solidifies your own learning',
    whyDev: 'Teaching locks in learning faster than doing alone. Explaining a workflow to someone else is how Learners cement Familiar-level habits.',
  },
  {
    id: 'w8',
    week: 'Week 8',
    action: 'Review your Copilot usage; set your next skill goal with your champion',
    whyDev: 'Reflection closes the loop. Reviewing usage data and setting a next goal with your champion turns an 8-week sprint into sustained growth toward Skilled.',
  },
];

const COURSES = [
  // Do These Now
  { id: 1, title: 'Getting Started with Microsoft Copilot', source: 'LinkedIn Learning', duration: '32 min', bucket: 'now', reason: 'Your on-ramp. Covers Copilot in Teams, Outlook, and Word — exactly where you live. Do this first before anything else.' },
  { id: 2, title: 'Prompting: The Basics', source: 'Obi · Prompt Mastery Path', duration: '15 min', bucket: 'now', reason: 'Prompting is a PM skill. The context-role-task-format framework maps directly to how you write briefs for engineers. 15 minutes, big multiplier.' },
  { id: 3, title: 'Explore MS Copilot Fundamentals for Everyday Tasks', source: 'Microsoft', duration: '33 min', bucket: 'now', reason: 'Maps directly to your day: emails, meeting summaries, document drafting. Pair back-to-back with course 1.' },
  { id: 4, title: 'Copilot Chat: Best Practices & Use Cases', source: 'Microsoft', duration: '30 min', bucket: 'now', reason: 'Layers Copilot into your existing PM rituals: standups, retros, stakeholder updates. Do this once you have the basics.' },
  { id: 5, title: 'AI Essentials for Every Employee', source: 'Microsoft', duration: '20 min', bucket: 'now', reason: 'A fast mental model of what AI is and how it applies to your work. Pairs well with the Copilot courses.' },
  // Do These Later
  { id: 6, title: 'Prompting (Advanced) — Analysis and Reasoning', source: 'Microsoft', duration: '42 min', bucket: 'later', reason: "Come back here after real usage time. These techniques only click once you've built intuition through practice." },
  { id: 7, title: 'Using AI to Synthesize Research', source: 'LinkedIn Learning', duration: '38 min', bucket: 'later', reason: "Directly relevant to your research workflows. Great once you've built Copilot fluency and are ready to apply it to discovery." },
  { id: 8, title: 'Copilot in Microsoft Teams: Advanced Collaboration', source: 'Microsoft', duration: '28 min', bucket: 'later', reason: 'Practical for async and cross-functional team work. Worth it once Copilot is already part of your daily routine.' },
  { id: 9, title: 'AI for Data Analysis with Copilot', source: 'Microsoft', duration: '45 min', bucket: 'later', reason: "Good for working with product metrics and usage data. Build this skill once you're comfortable with foundational prompting." },
  { id: 10, title: 'Copilot in PowerPoint: Storytelling with AI', source: 'Microsoft', duration: '25 min', bucket: 'later', reason: 'Valuable if you do frequent exec or board presentations. Save for when you have a big deck coming up.' },
  { id: 11, title: 'Introduction to Responsible AI', source: 'Microsoft', duration: '35 min', bucket: 'later', reason: "Important for your credibility as a PM building or buying AI features. Don't skip this forever — just later." },
  // Maybe Another Time
  { id: 12, title: 'Your Recruiting Assistant with MS Copilot', source: 'LinkedIn Learning', duration: '18 min', bucket: 'skip', reason: 'Applies to high-volume hiring workflows. Not a priority unless you are actively building a team right now.' },
  { id: 13, title: 'Copilot for Finance Teams', source: 'Microsoft', duration: '32 min', bucket: 'skip', reason: 'Role-specific to finance workflows. Interesting context but not immediately applicable to product management.' },
  { id: 14, title: 'Machine Learning Foundations', source: 'LinkedIn Learning', duration: '2h 20min', bucket: 'skip', reason: "Technically rich, but more than you need right now. Revisit if you move into AI product strategy as a core focus." },
  { id: 15, title: 'AI in Operations and Supply Chain', source: 'Microsoft', duration: '50 min', bucket: 'skip', reason: 'Interesting for cross-functional context. Low priority for your current role and goals.' },
];

const VIDEOS = [
  // PM Strategy
  { id: 1, group: 'PM Strategy', title: 'How I Use AI as a Product Manager (Real Workflows, Not Theory)', channel: "Lenny's Podcast", duration: '58 min', color: 'from-orange-500 to-red-600', url: 'https://www.youtube.com/@LennysPodcast', reason: 'Real PM workflows. Covers AI-assisted discovery, roadmapping, and stakeholder alignment from top practitioners.' },
  { id: 2, group: 'PM Strategy', title: 'AI in Product Strategy: What Changes and What Doesn\'t', channel: 'Shreyas Doshi', duration: '47 min', color: 'from-purple-500 to-pink-600', url: 'https://www.youtube.com/@ShreyasDoshi', reason: 'One of the sharpest PM thinkers on AI. Separates hype from durable shifts in how you should set strategy.' },
  { id: 3, group: 'PM Strategy', title: "The PM's Guide to Prompt Engineering", channel: 'Product School', duration: '34 min', color: 'from-blue-500 to-indigo-600', url: 'https://www.youtube.com/@ProductSchool', reason: 'Concrete prompts for PRDs, user stories, and competitive analysis. Pause and try them as you watch.' },
  { id: 4, group: 'PM Strategy', title: 'What Makes an AI-Native Product Manager', channel: 'Reforge', duration: '52 min', color: 'from-rose-500 to-red-600', url: 'https://www.youtube.com/@Reforge', reason: 'Reforge breaks down what separates AI-fluent PMs from the rest. Essential career framing.' },
  // Research & Discovery
  { id: 5, group: 'Research & Discovery', title: 'Synthesizing 50 User Interviews with AI in 20 Minutes', channel: 'UX Research Explained', duration: '22 min', color: 'from-teal-500 to-cyan-600', url: 'https://www.youtube.com/@UXResearchExplained', reason: 'The most immediately actionable video on your list. Try this method on your next research batch.' },
  { id: 6, group: 'Research & Discovery', title: 'Continuous Discovery with AI: What Actually Works', channel: 'Product Talk', duration: '44 min', color: 'from-green-500 to-emerald-600', url: 'https://www.youtube.com/@ProductTalk', reason: "Teresa Torres's take on integrating AI into continuous discovery cycles. Practical and grounded." },
  { id: 7, group: 'Research & Discovery', title: 'How AI is Changing User Research Forever', channel: 'Nielsen Norman Group', duration: '31 min', color: 'from-cyan-500 to-blue-600', url: 'https://www.youtube.com/@NNgroup', reason: 'NN/g is the gold standard on research methods. This is their honest assessment of where AI helps vs. hurts.' },
  { id: 8, group: 'Research & Discovery', title: 'AI-Powered Competitive Analysis for PMs', channel: 'Lenny\'s Podcast', duration: '38 min', color: 'from-amber-500 to-orange-500', url: 'https://www.youtube.com/@LennysPodcast', reason: 'A practical framework for using AI to run faster, richer competitive analysis. High ROI for your role.' },
  // Stay Current
  { id: 9, group: 'Stay Current', title: 'How AI is Reshaping the PM Role (2025 Honest Take)', channel: 'The Product Podcast', duration: '41 min', color: 'from-slate-500 to-gray-600', url: 'https://www.youtube.com/@TheProductPodcast', reason: 'Which PM skills AI augments vs. replaces. Great for career clarity and positioning.' },
  { id: 10, group: 'Stay Current', title: 'State of AI in Product Management 2025', channel: 'Lenny\'s Newsletter', duration: '63 min', color: 'from-violet-500 to-purple-600', url: 'https://www.youtube.com/@LennysPodcast', reason: 'Annual benchmark of how PMs are using AI. Good for calibrating where you are vs. the field.' },
  { id: 11, group: 'Stay Current', title: "A PM's Guide to Understanding LLMs (No PhD Required)", channel: 'Pragmatic Institute', duration: '55 min', color: 'from-indigo-500 to-blue-600', url: 'https://www.youtube.com/@PragmaticInstitute', reason: 'Builds the technical intuition you need to have credible AI product conversations with engineering.' },
  { id: 12, group: 'Stay Current', title: 'AI Strategy for Non-Technical Leaders', channel: 'Harvard Business Review', duration: '28 min', color: 'from-red-600 to-rose-700', url: 'https://www.youtube.com/@HarvardBusinessReview', reason: "HBR's take on AI leadership. Good for prepping exec conversations and board-level AI discussions." },
];

const EVENTS = [
  {
    id: 'vibathon',
    name: 'Vibe-A-Thon 2025',
    type: 'Hackathon',
    date: 'June 12–13, 2025',
    desc: "SCE's AI creativity hackathon. Build something with Copilot in 24 hours — no coding required. Prizes, judges, and a lot of caffeine.",
    color: 'from-violet-600 to-pink-600',
    cta: 'Register now',
    icon: '⚡',
    hot: true,
  },
  {
    id: 'sprint',
    name: 'AI Learning Sprint',
    type: 'Monthly Cohort',
    date: 'June 3 — June 28, 2025',
    desc: 'A 4-week structured learning track led by the AI CoE. June cohort starts June 3rd. Limited to 40 participants.',
    color: 'from-blue-600 to-indigo-600',
    cta: 'Reserve a spot',
    icon: '🚀',
    hot: false,
  },
  {
    id: 'officehours',
    name: 'Copilot Office Hours',
    type: 'Weekly Drop-in',
    date: 'Every Wednesday, 2–3 PM',
    desc: 'Bring your questions, blockers, or ideas. Marcus Webb (your Copilot Champion) hosts this open session for the product org.',
    color: 'from-emerald-600 to-teal-600',
    cta: 'Add to calendar',
    icon: '💬',
    hot: false,
  },
  {
    id: 'townhall',
    name: 'AI CoE Town Hall',
    type: 'Quarterly Update',
    date: 'June 20, 2025 · 11 AM',
    desc: "Quarterly state-of-AI update from Karen Hernandez. New tool approvals, policy updates, and open Q&A.",
    color: 'from-amber-600 to-orange-600',
    cta: 'Add to calendar',
    icon: '📋',
    hot: false,
  },
];

const COMMUNITY = {
  champion: { name: 'Marcus Webb', role: 'Your Copilot Champion', dept: 'Product & Design Org', bio: 'Marcus is your first call for anything Copilot — setup to advanced workflows. Open office hours every 2nd Wednesday for the product org.', initials: 'MW', color: 'from-violet-500 to-purple-600' },
  leaders: [
    { name: 'Karen Hernandez', role: 'VP, Workplace Technology', bio: "Sponsors SCE's AI transformation initiative and leads the enterprise Copilot rollout. The exec champion for AI product decisions.", initials: 'KH', color: 'from-blue-500 to-indigo-600', action: 'Follow on Viva' },
    { name: 'David Okafor', role: 'Director, AI Enablement', bio: 'Owns the AI Center of Excellence and runs the PM AI working group monthly. Your ally for any AI features in your roadmap.', initials: 'DO', color: 'from-emerald-500 to-teal-600', action: 'Join working group' },
  ],
  coe: { name: 'AI Center of Excellence', bullets: ['Sets AI usage guidelines and policies', 'Runs monthly learning sprints', 'Maintains approved AI use case library', 'Reviews tools before enterprise rollout'] },
  portal: { name: 'AI Learning Portal', url: '#', bullets: ['Tool access and setup guides', 'Training calendar and recordings', 'Approved AI use cases by department', 'Submit your own AI use case'] },
};

const TRENDS = [
  { title: 'AI-native teams are shipping 2× faster', detail: "Teams embedding AI into spec writing and research are compressing timelines — it's becoming a hiring expectation at top companies.", hot: true, citation: 'McKinsey Global Institute, "The Economic Potential of Generative AI," 2024' },
  { title: 'Prompting is the new requirements skill', detail: 'Writing clear prompts is structurally similar to writing clear requirements. PMs who get this become the bridge between AI and business value.', hot: true, citation: 'Microsoft Research, GitHub Copilot Impact Study, 2024' },
  { title: 'AI research tools are maturing fast', detail: 'Dovetail AI, Notion AI, and Claude are making qualitative synthesis dramatically faster. Structuring data for AI analysis is a rising PM superpower.', hot: false, citation: 'Nielsen Norman Group, "AI Tools for UX Research," 2024' },
  { title: "Your competitors are using Copilot daily", detail: "Microsoft data shows Copilot saves 30+ minutes per day. That's 2.5 hours a week of strategic thinking time left on the table.", hot: false, citation: 'Microsoft Work Trend Index Annual Report, 2024' },
];

const INFLUENCE = [
  { area: 'Discovery & Research', level: 92 },
  { area: 'Documentation & Specs', level: 88 },
  { area: 'Data Analysis', level: 79 },
  { area: 'Stakeholder Comms', level: 71 },
  { area: 'Roadmap Prioritization', level: 65 },
];

const AI_FIRST_COURSES = [
  {
    id: 'pmp',
    title: 'Prompt Mastery Path',
    tagline: 'Learn by doing — with an AI coach guiding every step',
    desc: "A conversational learning experience where an AI walks you through prompting techniques in real time. No slides, no videos — just you and an AI coach building increasingly powerful prompts together.",
    badge: 'AI-First Experience',
    icon: '🧠',
    color: 'from-violet-600 via-indigo-600 to-blue-600',
    duration: '~45 min',
  },
  {
    id: 'agent',
    title: 'Making Your First Agent',
    tagline: 'Build something real in your very first session',
    desc: "An interactive chat-based course that guides you through building a simple AI agent for a PM use case — no coding required. Powered by Copilot Studio and built for people like you.",
    badge: 'AI-First Experience',
    icon: '🤖',
    color: 'from-emerald-600 via-teal-600 to-cyan-600',
    duration: '~60 min',
  },
];

const PDP_PROMPT = `I am a Senior Product Manager at SCE with a Learner AI skill level (working toward Familiar). My organization is rolling out Microsoft Copilot and I want to set meaningful AI-related performance goals.

Please write 1–2 SMART goals for my Performance Development Plan (PDP) based on this 8-week AI learning journey:

• Week 1: Install and configure Microsoft Copilot in Teams, Outlook, and Word
• Week 2: Complete 4 core AI foundation courses
• Week 3: Use AI to summarize a real meeting or draft a stakeholder email
• Week 4: Write my first AI-assisted PRD or strategy one-pager
• Week 5: Run an AI research synthesis session on real interview or survey data
• Week 6: Use AI to stress-test my current roadmap and surface missing signals
• Week 7: Teach one AI workflow to a team member or peer
• Week 8: Review Copilot usage and define my next AI skill development goal

For each goal, include: Goal Statement, Success Metrics, Timeline (target Q3 2025), and Development Activities. Write them at the level appropriate for a mid-to-senior IC in product management.`;

const AI_FIELD_PROMPT = `I am a Senior Product Manager at SCE with a Learner AI skill level (working toward Familiar). My organization is rolling out Microsoft Copilot.

I received an AI exposure score of 8.4/10 for my role, with high influence in:
• Discovery & Research (92%)
• Documentation & Specs (88%)
• Data Analysis (79%)
• Stakeholder Comms (71%)
• Roadmap Prioritization (65%)

Please help me understand:
1. What these scores mean for my day-to-day work as a PM
2. Which tasks in my role are most likely to be augmented vs. automated by AI in the next 12–24 months
3. 3–5 specific, actionable ways I should adapt my workflows now
4. What skills I should prioritize developing to stay ahead

Be specific to product management — not generic AI advice. Cite trends or research where relevant.`;

const YOUTUBE_PROMPT = `I am a Senior Product Manager at SCE interested in AI and product management. I want to build my own curated list of YouTube channels and videos to stay current — similar to a personalized learning feed.

My interests include:
• AI strategy and the evolving PM role
• User research synthesis with AI
• Prompt engineering for product work
• Competitive analysis and discovery workflows
• Responsible AI and enterprise rollout

Please recommend:
1. 8–12 YouTube channels worth following (with brief rationale for each)
2. A prioritized list of specific videos I should watch first
3. Group them by theme (e.g. strategy, research, technical fluency, career)
4. Flag any that are especially practical vs. theoretical

Note: These are for personal learning outside company training. Prioritize practitioners and respected PM voices over hype.`;

const COPILOT_USAGE = {
  period: 'Last 90 days',
  chatCount: 47,
  percentile: 62,
  orgMedian: 31,
  orgAvg: 38,
  benchmarkMinutesPerChat: 4,
  weeklyTrend: [3, 5, 4, 8, 6, 9, 7, 5, 6, 4, 5, 7, 8],
  peerLabel: 'Product & Design org',
};

const COPILOT_LICENSE = {
  hasLicense: false,
  chatOnly: {
    label: 'Copilot Chat',
    status: 'Active',
    desc: 'Browser-based chat for questions, drafting, and brainstorming — available to all SCE employees.',
  },
  fullLicense: {
    label: 'Microsoft 365 Copilot',
    status: 'Not assigned',
    desc: 'Embedded AI across the apps you already use — automates work where it happens.',
    features: [
      { icon: Mail, label: 'Outlook', detail: 'Draft replies, summarize threads, prep for meetings' },
      { icon: Users, label: 'Teams', detail: 'Meeting recaps, action items, live meeting notes' },
      { icon: FileText, label: 'Word', detail: 'Generate and rewrite docs, PRDs, and briefs in-place' },
      { icon: Presentation, label: 'PowerPoint', detail: 'Build decks from outlines, reformat slides' },
      { icon: Sparkles, label: 'Automation', detail: 'Copilot agents, Power Automate flows, scheduled tasks' },
    ],
  },
  requestSteps: [
    'Confirm with your manager that a Copilot license fits your role and workflow',
    'Submit a license request through the AI Learning Portal (manager approval required)',
    'IT provisions your license — typically 3–5 business days',
    'Complete the 30-min onboarding checklist to activate Teams, Outlook, and Word',
  ],
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

function usePersisted<T>(key: string, init: T) {
  const [val, setVal] = useState<T>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  const set = (next: T) => { localStorage.setItem(key, JSON.stringify(next)); setVal(next); };
  return [val, set] as const;
}

// ─── Shared ────────────────────────────────────────────────────────────────────

function Tag({ text }: { text: string }) {
  return <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">{text}</p>;
}

function AiNote({ text }: { text: string }) {
  return (
    <div className="flex gap-1.5 items-start">
      <Bot size={12} className="text-white/30 flex-shrink-0 mt-0.5" />
      <p className="text-white/40 text-xs italic leading-relaxed">{text}</p>
    </div>
  );
}

function DetailCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`h-full bg-white/8 backdrop-blur-2xl border border-white/12 rounded-3xl p-8 flex flex-col overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

function Citation({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const openPopover = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const width = 256;
      const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
      setCoords({ top: r.bottom + 6, left });
    }
    setOpen(true);
  };

  const closePopover = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePopover();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const popover =
    open &&
    createPortal(
      <>
        <div
          className="fixed inset-0 z-[100]"
          aria-hidden
          onClick={closePopover}
        />
        <div
          role="tooltip"
          className="fixed z-[110] w-64 max-w-[calc(100vw-16px)] bg-slate-900 border border-white/20 rounded-xl p-3 text-xs text-white/70 leading-relaxed shadow-2xl"
          style={{ top: coords.top, left: coords.left }}
          onClick={e => e.stopPropagation()}
        >
          <span className="block text-white/40 text-[10px] mb-1.5 font-semibold uppercase tracking-wide">Source</span>
          {text}
        </div>
      </>,
      document.body,
    );

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={e => {
          e.stopPropagation();
          if (open) closePopover();
          else openPopover();
        }}
        aria-expanded={open}
        aria-label={open ? 'Hide source' : 'Show source'}
        className={`relative z-10 inline-flex ml-1 align-middle w-5 h-5 rounded-full border text-[10px] font-semibold items-center justify-center transition-colors leading-none cursor-pointer ${
          open
            ? 'border-white/50 text-white/80 bg-white/15'
            : 'border-white/25 text-white/40 hover:border-white/50 hover:text-white/70 hover:bg-white/10'
        }`}
      >
        ?
      </button>
      {popover}
    </>
  );
}

function CopyPromptModal({
  onClose,
  title,
  subtitle,
  prompt,
  attribution,
  accentClass = 'text-violet-400',
  gradient = 'from-violet-500 to-indigo-600',
}: {
  onClose: () => void;
  title: string;
  subtitle: string;
  prompt: string;
  attribution: { name: string; team: string };
  accentClass?: string;
  gradient?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md px-4 pb-4 sm:pb-0" onClick={onClose}>
      <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-lg">{title}</h3>
            <p className="text-white/45 text-sm mt-1">{subtitle}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors ml-4 flex-shrink-0">✕</button>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 max-h-52 overflow-y-auto">
          <pre className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap font-mono">{prompt}</pre>
        </div>
        <button
          onClick={copy}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${copied ? 'bg-green-600 text-white' : 'bg-white text-slate-900 hover:bg-white/90'}`}
        >
          {copied ? '✓ Copied to clipboard!' : 'Copy Prompt'}
        </button>
        <div className="mt-4 flex items-center gap-2">
          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
            <Bot size={11} className="text-white" />
          </div>
          <p className="text-white/30 text-xs">
            Prompt built by <span className={`${accentClass} font-semibold`}>{attribution.name}</span> · {attribution.team}
          </p>
        </div>
      </div>
    </div>
  );
}

function LicenseRequestModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md px-4 pb-4 sm:pb-0" onClick={onClose}>
      <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-lg">Request a Copilot License</h3>
            <p className="text-white/45 text-sm mt-1">Unlock embedded AI in Teams, Outlook, Word, and more.</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors ml-4 flex-shrink-0">✕</button>
        </div>

        {!submitted ? (
          <>
            <div className="bg-amber-500/10 border border-amber-400/20 rounded-2xl px-4 py-3 mb-4">
              <p className="text-amber-200/90 text-xs leading-relaxed">
                You currently have <span className="font-bold">Copilot Chat only</span>. A full license adds in-app automation — the biggest time savings for PMs happen inside Outlook and Teams, not in chat.
              </p>
            </div>
            <p className="text-white/35 text-xs font-semibold uppercase tracking-wide mb-3">How to request</p>
            <ol className="space-y-3 mb-5">
              {COPILOT_LICENSE.requestSteps.map((step, i) => (
                <li key={step} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-white/50 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <p className="text-white/60 text-sm leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
            <button
              onClick={() => setSubmitted(true)}
              className="w-full py-3 rounded-xl font-bold text-sm bg-white text-slate-900 hover:bg-white/90 transition-all"
            >
              Start License Request →
            </button>
            <p className="text-white/25 text-xs text-center mt-3">Opens AI Learning Portal · Manager approval required</p>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-emerald-300" strokeWidth={3} />
            </div>
            <p className="text-white font-bold text-lg mb-2">Request submitted</p>
            <p className="text-white/45 text-sm leading-relaxed mb-5">
              Your manager will receive an approval notification. You'll get an email from IT once your license is provisioned.
            </p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/18 text-white text-sm font-semibold transition-colors">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PDPModal({ onClose }: { onClose: () => void }) {
  return (
    <CopyPromptModal
      onClose={onClose}
      title="Turn this into a PDP Goal"
      subtitle="Copy this prompt and paste it into Claude, Copilot, or ChatGPT."
      prompt={PDP_PROMPT}
      attribution={{ name: 'Andrew Garcia', team: 'SCE AI Team' }}
    />
  );
}

// ─── S1 — Orientation ─────────────────────────────────────────────────────────

function BigIdeaAccordion({
  priority,
  expanded,
  onToggle,
}: {
  priority: (typeof PRIORITIES)[number];
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className={`rounded-xl border transition-colors ${
        expanded ? 'bg-white/10 border-white/16' : 'bg-white/5 border-white/10 hover:border-white/14'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full text-left px-4 py-3.5 sm:px-5 sm:py-4"
      >
        <div className="flex gap-3 items-start">
          <span className="text-white/20 font-black text-lg leading-none flex-shrink-0 pt-0.5">{priority.num}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm sm:text-base leading-snug pr-2">{priority.title}</h3>
            {!expanded && (
              <p className="text-white/40 text-xs sm:text-sm leading-relaxed mt-1.5 line-clamp-2">{priority.desc}</p>
            )}
          </div>
          <ChevronDown
            size={18}
            className={`text-white/35 flex-shrink-0 mt-0.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 ml-9 sm:ml-10 space-y-3 border-t border-white/8 mx-4 sm:mx-5 mb-1">
          <p className="text-white/55 text-sm leading-relaxed">{priority.desc}</p>
          <AiNote text={priority.whyNow} />
        </div>
      )}
    </article>
  );
}

function WeekPlanItem({
  item,
  checked,
  expanded,
  onToggleDone,
  onToggleExpand,
}: {
  item: (typeof WEEKLY_PLAN)[number];
  checked: boolean;
  expanded: boolean;
  onToggleDone: () => void;
  onToggleExpand: () => void;
}) {
  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        checked ? 'bg-white/12 border-white/20' : 'bg-white/5 border-white/8'
      }`}
    >
      <div className="flex gap-2 items-start px-3 py-3">
        <button
          type="button"
          onClick={onToggleDone}
          aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${
            checked ? 'bg-white border-white' : 'border-white/25 hover:border-white/50'
          }`}
        >
          {checked && <Check size={11} className="text-violet-900" strokeWidth={3} />}
        </button>
        <div className="flex-1 min-w-0">
          <span className="text-white/30 text-xs font-semibold">{item.week}</span>
          <p className={`text-sm leading-relaxed mt-0.5 ${checked ? 'text-white/45 line-through' : 'text-white/75'}`}>
            {item.action}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={expanded}
          aria-label="Why this matters for your development"
          className="flex-shrink-0 p-1 rounded-lg text-white/35 hover:text-white/60 hover:bg-white/10 transition-colors"
        >
          <ChevronDown size={16} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {expanded && (
        <div className="px-3 pb-3 pt-0 ml-7 border-t border-white/8 mx-3 mb-2">
          <AiNote text={item.whyDev} />
        </div>
      )}
    </div>
  );
}

function S1Full() {
  const [done, setDone] = usePersisted<string[]>('sce-weeks', []);
  const [showPDP, setShowPDP] = useState(false);
  const [expandedIdea, setExpandedIdea] = useState<string | null>('01');
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const toggle = (id: string) => setDone(done.includes(id) ? done.filter(x => x !== id) : [...done, id]);
  const doneCount = done.length;

  return (
    <>
      {showPDP && <PDPModal onClose={() => setShowPDP(false)} />}
      <div className="h-full flex flex-col min-h-0">
        {/* Hero — compact */}
        <header className="flex-none mb-5 lg:mb-6">
          <Tag text="Orientation · Your AI Game Plan" />
          <h1
            className="text-white leading-tight tracking-tight mb-2"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.35rem)', fontWeight: 900 }}
          >
            We got your score. Here are 4 big ideas to reshape your role.
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-3xl mb-3">
            Hi {PERSONA.name.split(' ')[0]} — based on your assessment as a {PERSONA.role}, these are the
            highest-leverage shifts to make <span className="text-white/75 font-semibold">right now</span>, not someday.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              `🏢 ${PERSONA.role}`,
              `⚡ AI Level: ${PERSONA.aiLevel}`,
              `📊 ${PERSONA.exposureScore}/10 role exposure`,
            ].map(t => (
              <span key={t} className="px-3 py-1 bg-white/10 border border-white/12 rounded-full text-white/60 text-xs font-semibold">
                {t}
              </span>
            ))}
          </div>
        </header>

        {/* Article + todos */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8">
          {/* Left — article */}
          <div className="lg:col-span-7 flex flex-col lg:min-h-0 min-w-0">
            <div className="flex-none mb-4">
              <h2 className="text-white font-bold text-sm sm:text-base">4 big ideas to learn right now</h2>
              <p className="text-white/40 text-xs sm:text-sm mt-0.5">
                Scan the list, then open one at a time — each is a mental model, not a course to finish.
              </p>
            </div>
            <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
              <div className="max-w-2xl space-y-2 pb-4 lg:pb-0">
                {PRIORITIES.map(p => (
                  <BigIdeaAccordion
                    key={p.num}
                    priority={p}
                    expanded={expandedIdea === p.num}
                    onToggle={() => setExpandedIdea(expandedIdea === p.num ? null : p.num)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right — todos */}
          <aside className="lg:col-span-5 flex flex-col lg:min-h-0 min-w-0 lg:border-l lg:border-white/8 lg:pl-8 pt-6 lg:pt-0 border-t lg:border-t-0 border-white/8">
            <div className="flex-none flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-wide">Put it into practice</p>
                <p className="text-white/30 text-xs mt-0.5">{doneCount} of 8 done</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPDP(true)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/18 border border-white/15 text-white text-xs font-bold rounded-xl transition-colors"
              >
                <span>📋</span> Turn into PDP
              </button>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full mb-4 flex-none overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${(doneCount / 8) * 100}%` }}
              />
            </div>
            <p className="text-white/30 text-xs mb-3 flex-none">
              Optional weekly checklist. Check off as you go — expand for why each step matters.
            </p>
            <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto space-y-2 lg:pr-1 pb-4 lg:pb-0">
              {WEEKLY_PLAN.map(item => (
                <WeekPlanItem
                  key={item.id}
                  item={item}
                  checked={done.includes(item.id)}
                  expanded={expandedWeek === item.id}
                  onToggleDone={() => toggle(item.id)}
                  onToggleExpand={() => setExpandedWeek(expandedWeek === item.id ? null : item.id)}
                />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

// ─── S2 — Trends ─────────────────────────────────────────────────────────────

function S2Hero() {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <>
      {showPrompt && (
        <CopyPromptModal
          onClose={() => setShowPrompt(false)}
          title="Learn more about AI in your field"
          subtitle="Copy this prompt and paste it into Copilot, Claude, or ChatGPT."
          prompt={AI_FIELD_PROMPT}
          attribution={{ name: 'Daniel Gomez', team: 'IT' }}
          accentClass="text-blue-400"
          gradient="from-blue-500 to-indigo-600"
        />
      )}
    <div>
      <Tag text="AI in Your Field" />
      <h2 className="text-white font-bold text-lg leading-snug mb-3">
        This is how AI is reshaping <span className="text-blue-300">your specific role</span> — not AI in general.
      </h2>
      <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mb-5 max-w-lg">
        <div className="flex gap-2 items-start">
          <Bot size={13} className="text-blue-300 flex-shrink-0 mt-0.5" />
          <p className="text-white/55 text-xs leading-relaxed italic">
            We analyzed 40+ published research reports — from McKinsey, Microsoft, Nielsen Norman Group, and Harvard — on how AI is changing the Product Management role specifically. Your 8.4 score reflects where your day-to-day tasks fall on the AI impact spectrum, ranked by how quickly automation and AI augmentation are moving in each area.
          </p>
        </div>
      </div>
      <div className="flex items-end gap-4 mb-6">
        <span className="text-white leading-none font-black tracking-tighter" style={{ fontSize: 'clamp(5rem, 14vw, 11rem)', fontWeight: 900 }}>8.4</span>
        <div className="mb-4">
          <p className="text-white/35 text-sm">out of 10</p>
          <p className="text-white font-bold text-lg">Highly AI-Influenced</p>
        </div>
      </div>
      <div className="space-y-3 max-w-lg">
        {INFLUENCE.map(item => (
          <div key={item.area}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-white/60 font-medium">{item.area}</span>
              <span className="text-white font-bold">{item.level}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${item.level}%`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1) 0.2s' }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-white/8 max-w-lg">
        <button
          onClick={() => setShowPrompt(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/18 border border-white/15 text-white text-xs font-bold rounded-xl transition-colors"
        >
          <BookOpen size={14} /> Learn more about AI in your field
        </button>
      </div>
    </div>
    </>
  );
}

function S2Detail() {
  return (
    <DetailCard>
      <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">Key signals right now</p>
      <div className="space-y-4 flex-1">
        {TRENDS.map(t => (
          <div key={t.title} className="relative flex gap-3 p-4 bg-white/8 rounded-2xl border border-white/10">
            {t.hot ? <Flame size={16} className="text-orange-300 flex-shrink-0 mt-0.5" /> : <AlertCircle size={16} className="text-blue-300 flex-shrink-0 mt-0.5" />}
            <div>
              <div className="flex items-start gap-2 mb-1 flex-wrap">
                <div className="text-white font-semibold text-sm leading-snug">
                  {t.title}
                  <Citation text={t.citation} />
                </div>
                {t.hot && <span className="px-1.5 py-0.5 bg-orange-500/30 text-orange-300 text-xs rounded-full font-medium flex-shrink-0">Hot</span>}
              </div>
              <p className="text-white/45 text-xs leading-relaxed">{t.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-5 border-t border-white/10">
        <AiNote text="PMs who build AI fluency now will have a compounding advantage over the next 3–5 years. The window to get ahead is open — but it won't stay open." />
      </div>
    </DetailCard>
  );
}

// ─── S3 — Courses ─────────────────────────────────────────────────────────────

const BUCKETS = [
  {
    key: 'now',
    label: 'Do These Now',
    sub: "High-signal, low-effort — these will change how you work within days, not months.",
    accent: 'text-emerald-300',
    border: 'border-emerald-400/20',
    bg: 'bg-emerald-400/8',
    headerBg: 'bg-emerald-400/15',
    numBg: 'bg-emerald-400/25 text-emerald-200',
    btn: 'bg-white text-emerald-950',
  },
  {
    key: 'later',
    label: 'Do These Later',
    sub: "Great courses — just build the foundation first. Come back here in weeks 3–5.",
    accent: 'text-blue-300',
    border: 'border-blue-400/20',
    bg: 'bg-blue-400/8',
    headerBg: 'bg-blue-400/15',
    numBg: 'bg-blue-400/25 text-blue-200',
    btn: 'bg-blue-400/25 text-blue-100',
  },
  {
    key: 'skip',
    label: 'Maybe Another Time',
    sub: "Low priority for your current role and goals. Not deleted — just deprioritized.",
    accent: 'text-white/35',
    border: 'border-white/10',
    bg: 'bg-white/5',
    headerBg: 'bg-white/8',
    numBg: 'bg-white/10 text-white/40',
    btn: 'bg-white/10 text-white/50',
  },
];

function S3Full() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <Tag text="Courses Built for You" />
          <h1 className="text-white leading-tight tracking-tight" style={{ fontSize: 'clamp(1.8rem, 3.8vw, 3rem)', fontWeight: 900 }}>
            15 courses. Ranked for you.
          </h1>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 mb-1">
          <Bot size={13} className="text-white/30" />
          <p className="text-white/30 text-xs italic">AI-sorted for a Senior PM at Learner level</p>
        </div>
      </div>

      {/* AI-First featured experiences */}
      <div className="flex-none mb-4">
        <p className="text-white/35 text-xs font-semibold uppercase tracking-wide mb-2.5">✦ AI-First Experiences — Start Here</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AI_FIRST_COURSES.map(course => (
            <div key={course.id} className={`relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br ${course.color} p-4 flex gap-4 group hover:scale-[1.01] transition-transform cursor-pointer`}>
              {/* Glow background */}
              <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl">
                {course.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full tracking-wide">{course.badge}</span>
                  <span className="text-white/55 text-xs">{course.duration}</span>
                </div>
                <p className="text-white font-black text-sm leading-snug mb-0.5">{course.title}</p>
                <p className="text-white/70 text-xs italic mb-1.5">{course.tagline}</p>
                <p className="text-white/50 text-xs leading-relaxed hidden sm:block">{course.desc}</p>
              </div>
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 transition-colors flex items-center justify-center">
                  <Zap size={14} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3-column buckets */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {BUCKETS.map(bucket => {
          const items = COURSES.filter(c => c.bucket === bucket.key);
          return (
            <div key={bucket.key} className={`flex flex-col rounded-2xl border ${bucket.border} overflow-hidden min-h-0`}>
              {/* Column header */}
              <div className={`flex-none ${bucket.headerBg} px-4 py-3 border-b ${bucket.border}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className={`font-bold text-sm ${bucket.accent}`}>{bucket.label}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bucket.numBg}`}>{items.length}</span>
                </div>
                <p className="text-white/35 text-xs leading-relaxed">{bucket.sub}</p>
              </div>

              {/* Course list */}
              <div className={`flex-1 overflow-y-auto ${bucket.bg} space-y-px`}>
                {items.map((course, i) => (
                  <div key={course.id} className="flex gap-3 px-4 py-3 border-b border-white/5 last:border-0 group hover:bg-white/5 transition-colors">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black mt-0.5 ${bucket.numBg}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-xs leading-snug mb-0.5 ${bucket.key === 'skip' ? 'text-white/45' : 'text-white/85'}`}>
                        {course.title}
                      </p>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-white/25 text-xs">{course.source}</span>
                        <span className="text-white/20 text-xs">·</span>
                        <Clock size={9} className="text-white/25" />
                        <span className="text-white/25 text-xs">{course.duration}</span>
                      </div>
                      <AiNote text={course.reason} />
                    </div>
                    <button className={`flex-shrink-0 self-start mt-0.5 px-2 py-1 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity ${bucket.btn}`}>
                      {bucket.key === 'skip' ? 'Add' : 'Start'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── S4 — Videos ──────────────────────────────────────────────────────────────

const VIDEO_GROUPS = ['PM Strategy', 'Research & Discovery', 'Stay Current'];

function S4Full() {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const filtered = activeGroup ? VIDEOS.filter(v => v.group === activeGroup) : VIDEOS;

  return (
    <>
      {showPrompt && (
        <CopyPromptModal
          onClose={() => setShowPrompt(false)}
          title="Build my own YouTube recommendations"
          subtitle="Copy this prompt and paste it into Copilot, Claude, or ChatGPT."
          prompt={YOUTUBE_PROMPT}
          attribution={{ name: 'Michelle Vodya', team: 'Marketing' }}
          accentClass="text-rose-400"
          gradient="from-rose-500 to-orange-600"
        />
      )}
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-5">
        <Tag text="Beyond the Firewall" />
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div>
            <h1 className="text-white leading-tight tracking-tight mb-2" style={{ fontSize: 'clamp(1.8rem, 3.8vw, 3rem)', fontWeight: 900 }}>
              The internet is your unfair advantage.
            </h1>
            <p className="text-white/45 text-sm max-w-2xl leading-relaxed">
              AI moves too fast for any company's training library to keep up. The best practitioners share everything publicly — strategies, workflows, failures. This is who's worth your time.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 border border-amber-400/25 text-amber-300 text-xs font-semibold rounded-full">
              ⚠️ Not company-approved — use your judgment
            </span>
          </div>
        </div>
      </div>

      {/* Group filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setActiveGroup(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${!activeGroup ? 'bg-white/20 text-white' : 'bg-white/8 text-white/50 hover:bg-white/12'}`}
        >
          All ({VIDEOS.length})
        </button>
        {VIDEO_GROUPS.map(g => (
          <button
            key={g}
            onClick={() => setActiveGroup(activeGroup === g ? null : g)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeGroup === g ? 'bg-white/20 text-white' : 'bg-white/8 text-white/50 hover:bg-white/12'}`}
          >
            {g} ({VIDEOS.filter(v => v.group === g).length})
          </button>
        ))}
      </div>

      {/* Video grid */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto min-h-0 content-start">
        {filtered.map(v => (
          <div key={v.id} className="flex gap-3 bg-white/8 border border-white/10 rounded-2xl p-3 hover:bg-white/12 transition-colors group">
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center`}>
              <Play size={13} className="text-white ml-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-xs leading-snug mb-1 line-clamp-2">{v.title}</p>
              <div className="flex items-center gap-1 text-white/30 text-xs mb-1.5">
                <Youtube size={9} /><span className="text-white/45">{v.channel}</span>
                <span>·</span><span>{v.duration}</span>
              </div>
              <AiNote text={v.reason} />
              <a href={v.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-red-400 hover:text-red-300 font-semibold transition-colors opacity-0 group-hover:opacity-100">
                <ExternalLink size={10} /> Watch on YouTube
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-none mt-4 pt-4 border-t border-white/8">
        <button
          onClick={() => setShowPrompt(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/18 border border-white/15 text-white text-xs font-bold rounded-xl transition-colors"
        >
          <Youtube size={14} /> Build my own YouTube recommendations
        </button>
      </div>
    </div>
    </>
  );
}

// ─── S5 — AI Community @ SCE ──────────────────────────────────────────────────

function S5Full() {
  const { champion, leaders, coe, portal } = COMMUNITY;
  return (
    <div className="h-full flex flex-col">
      <div className="mb-5">
        <Tag text="AI Community @ SCE" />
        <h1 className="text-white leading-tight tracking-tight mb-1" style={{ fontSize: 'clamp(1.8rem, 3.8vw, 3rem)', fontWeight: 900 }}>
          You're not doing this alone.
        </h1>
        <p className="text-white/40 text-sm">The people, resources, and events to support your AI journey at SCE.</p>
      </div>

      {/* People + Resources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {/* Champion */}
        <div className="bg-gradient-to-br from-violet-900/60 to-purple-900/40 border border-violet-400/20 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <Avatar initials={champion.initials} color={champion.color} />
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-white font-bold text-sm">{champion.name}</p>
              </div>
              <span className="px-1.5 py-0.5 bg-violet-500/30 text-violet-300 text-xs rounded-full font-semibold">Copilot Champion</span>
            </div>
          </div>
          <p className="text-white/50 text-xs leading-relaxed flex-1">{champion.bio}</p>
          <AiNote text="Your highest-leverage first contact. Reaching out to Marcus before Vibe-A-Thon could open real collaboration doors early in your AI journey." />
          <button className="w-full py-2 bg-violet-500/25 hover:bg-violet-500/40 border border-violet-400/25 text-violet-200 text-xs font-bold rounded-xl transition-colors">
            Book office hours
          </button>
        </div>

        {/* Leaders */}
        {leaders.map((l, idx) => (
          <div key={l.name} className="bg-white/8 border border-white/12 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-start gap-2.5">
              <Avatar initials={l.initials} color={l.color} />
              <div>
                <p className="text-white font-bold text-sm">{l.name}</p>
                <p className="text-white/40 text-xs mt-0.5">{l.role}</p>
              </div>
            </div>
            <p className="text-white/45 text-xs leading-relaxed flex-1">{l.bio}</p>
            <AiNote text={idx === 0
              ? "Executive visibility matters. A connection here could influence which AI tools your team gets prioritized access to."
              : "Your direct ally for AI on the roadmap. Worth a 30-minute intro before your next product planning cycle."
            } />
            <button className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors font-medium">
              <Users size={11} /> {l.action}
            </button>
          </div>
        ))}

        {/* CoE */}
        <div className="bg-white/8 border border-white/12 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">{coe.name}</p>
              <p className="text-white/35 text-xs mt-0.5">SCE's AI governance hub</p>
            </div>
          </div>
          <ul className="space-y-1.5 flex-1">
            {coe.bullets.map(b => (
              <li key={b} className="flex items-start gap-2 text-white/45 text-xs">
                <div className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Events strip */}
      <div className="flex-1 min-h-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/30 text-xs font-semibold uppercase tracking-wide">Upcoming Events</p>
          <AiNote text="Live events accelerate learning 3–4× faster than self-paced courses. Vibe-A-Thon is your highest-leverage next step." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 h-[calc(100%-28px)]">
          {EVENTS.map(event => (
            <div key={event.id} className="bg-white/8 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 hover:bg-white/12 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl">{event.icon}</span>
                {event.hot && (
                  <span className="px-1.5 py-0.5 bg-rose-500/30 text-rose-300 text-xs rounded-full font-bold">New</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm leading-snug mb-0.5">{event.name}</p>
                <p className={`text-xs font-semibold mb-2 bg-gradient-to-r ${event.color} bg-clip-text text-transparent`}>
                  {event.type}
                </p>
                <p className="text-white/30 text-xs mb-1.5">{event.date}</p>
                <p className="text-white/45 text-xs leading-relaxed">{event.desc}</p>
              </div>
              <button className="flex items-center gap-1.5 mt-1 px-3 py-2 bg-white/10 hover:bg-white/18 border border-white/12 text-white text-xs font-bold rounded-xl transition-colors">
                <Calendar size={11} /> {event.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── S6 — Copilot Usage ───────────────────────────────────────────────────────

function PercentileGauge({ percentile }: { percentile: number }) {
  const markerLeft = `${percentile}%`;
  return (
    <div className="relative pt-2 pb-6">
      <div className="h-2 rounded-full bg-gradient-to-r from-white/10 via-white/25 to-white/10 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-sky-400/40 via-cyan-300/60 to-emerald-400/50 rounded-full" style={{ width: '100%' }} />
      </div>
      <div className="absolute top-0 flex flex-col items-center -translate-x-1/2" style={{ left: markerLeft }}>
        <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-cyan-300 shadow-lg shadow-cyan-500/30" />
        <span className="mt-2 text-white font-black text-sm whitespace-nowrap">{percentile}th</span>
      </div>
      <div className="flex justify-between mt-4 text-white/25 text-xs">
        <span>0th</span>
        <span>50th</span>
        <span>100th</span>
      </div>
    </div>
  );
}

function SCopilotHero() {
  const { chatCount, percentile, period, benchmarkMinutesPerChat, orgMedian, orgAvg, peerLabel, weeklyTrend } = COPILOT_USAGE;
  const totalMinutes = chatCount * benchmarkMinutesPerChat;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const maxWeek = Math.max(...weeklyTrend);

  return (
    <div>
      <Tag text="Your Copilot Usage" />
      <h2 className="text-white font-bold text-lg leading-snug mb-2">
        You're using it — here's how you <span className="text-cyan-300">compare</span>.
      </h2>
      <p className="text-white/40 text-sm mb-6 max-w-lg leading-relaxed">
        Based on your Copilot Chat activity in {period.toLowerCase()}. Benchmarks use a conservative {benchmarkMinutesPerChat} min saved per interaction.
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 max-w-2xl">
        <div className="bg-white/8 border border-white/12 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-cyan-300" />
            <span className="text-white/35 text-xs font-semibold uppercase tracking-wide">Chats</span>
          </div>
          <p className="text-white font-black text-4xl leading-none mb-1">{chatCount}</p>
          <p className="text-white/35 text-xs">{period}</p>
        </div>

        <div className="bg-white/8 border border-white/12 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-emerald-300" />
            <span className="text-white/35 text-xs font-semibold uppercase tracking-wide">Percentile</span>
          </div>
          <p className="text-white font-black text-4xl leading-none mb-1">{percentile}<span className="text-xl text-white/40">th</span></p>
          <p className="text-white/35 text-xs">vs. {peerLabel}</p>
        </div>

        <div className="bg-white/8 border border-white/12 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Timer size={14} className="text-violet-300" />
            <span className="text-white/35 text-xs font-semibold uppercase tracking-wide">Est. saved</span>
          </div>
          <p className="text-white font-black text-4xl leading-none mb-1">
            {hours > 0 ? `${hours}h` : ''}{mins > 0 ? ` ${mins}m` : hours === 0 ? `${mins}m` : ''}
          </p>
          <p className="text-white/35 text-xs">{chatCount} × {benchmarkMinutesPerChat} min</p>
        </div>
      </div>

      {/* Percentile gauge */}
      <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 mb-5 max-w-lg">
        <p className="text-white/50 text-xs font-semibold mb-1">Where you sit in your org</p>
        <PercentileGauge percentile={percentile} />
        <div className="flex gap-4 mt-1 text-xs">
          <span className="text-white/35">Org median: <span className="text-white/60 font-semibold">{orgMedian} chats</span></span>
          <span className="text-white/35">Org avg: <span className="text-white/60 font-semibold">{orgAvg} chats</span></span>
        </div>
        <p className="text-white/30 text-xs mt-3 italic">
          You're above median — solid adoption for your level. Power users in the 85th+ percentile average 70+ chats per quarter.
        </p>
      </div>

      {/* Weekly trend spark bars */}
      <div className="max-w-lg">
        <p className="text-white/35 text-xs font-semibold uppercase tracking-wide mb-2">Weekly activity</p>
        <div className="flex items-end gap-1 h-16">
          {weeklyTrend.map((count, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-sm bg-gradient-to-t from-cyan-500/30 to-cyan-300/70 transition-all"
                style={{ height: `${(count / maxWeek) * 100}%`, minHeight: count > 0 ? '4px' : '2px' }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-white/20 text-xs mt-1">
          <span>13 wks ago</span>
          <span>This week</span>
        </div>
      </div>
    </div>
  );
}

function SCopilotDetail() {
  const [showRequest, setShowRequest] = useState(false);
  const { hasLicense, chatOnly, fullLicense } = COPILOT_LICENSE;

  return (
    <>
      {showRequest && <LicenseRequestModal onClose={() => setShowRequest(false)} />}
      <DetailCard>
        <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">License Status</p>

        {/* Status banner */}
        <div className={`rounded-2xl border px-4 py-3 mb-5 flex items-start gap-3 ${hasLicense ? 'bg-emerald-500/10 border-emerald-400/25' : 'bg-amber-500/10 border-amber-400/25'}`}>
          {hasLicense ? (
            <Key size={18} className="text-emerald-300 flex-shrink-0 mt-0.5" />
          ) : (
            <Lock size={18} className="text-amber-300 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`font-bold text-sm ${hasLicense ? 'text-emerald-200' : 'text-amber-200'}`}>
              {hasLicense ? 'Full Copilot license active' : 'Copilot Chat only — no M365 license'}
            </p>
            <p className="text-white/45 text-xs mt-1 leading-relaxed">
              {hasLicense
                ? 'You have embedded Copilot across Teams, Outlook, Word, and PowerPoint.'
                : 'You can chat with Copilot, but in-app automation in your daily tools is locked.'}
            </p>
          </div>
        </div>

        {/* What you have vs what you're missing */}
        <div className="space-y-3 mb-5 flex-1">
          <div className="bg-white/6 border border-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-white/70 font-semibold text-sm">{chatOnly.label}</p>
              <span className="px-2 py-0.5 bg-emerald-500/25 text-emerald-300 text-xs font-bold rounded-full">{chatOnly.status}</span>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">{chatOnly.desc}</p>
          </div>

          <div className={`border rounded-xl p-3 ${hasLicense ? 'bg-white/6 border-white/10' : 'bg-white/4 border-white/8 border-dashed'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <p className={`font-semibold text-sm ${hasLicense ? 'text-white/70' : 'text-white/45'}`}>{fullLicense.label}</p>
              <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${hasLicense ? 'bg-emerald-500/25 text-emerald-300' : 'bg-white/10 text-white/35'}`}>
                {fullLicense.status}
              </span>
            </div>
            <p className="text-white/40 text-xs leading-relaxed mb-3">{fullLicense.desc}</p>
            <div className="space-y-2">
              {fullLicense.features.map(f => (
                <div key={f.label} className="flex gap-2.5 items-start">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${hasLicense ? 'bg-white/10' : 'bg-white/5'}`}>
                    <f.icon size={13} className={hasLicense ? 'text-white/60' : 'text-white/25'} />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${hasLicense ? 'text-white/65' : 'text-white/40'}`}>{f.label}</p>
                    <p className="text-white/30 text-xs leading-relaxed">{f.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!hasLicense && (
          <button
            onClick={() => setShowRequest(true)}
            className="w-full py-3 rounded-xl font-bold text-sm bg-white text-slate-900 hover:bg-white/90 transition-all flex items-center justify-center gap-2"
          >
            <Key size={15} /> Request Copilot License
          </button>
        )}

        <div className="mt-4 pt-4 border-t border-white/10">
          <AiNote text="PMs with full licenses report 2× the time savings vs. chat-only — mostly from meeting summaries and email drafting in Outlook." />
        </div>
      </DetailCard>
    </>
  );
}

// ─── Story config ─────────────────────────────────────────────────────────────

const STORIES = [
  { id: 'orientation', navLabel: 'Orientation', navDesc: 'Your game plan', bg: 'from-violet-950 via-purple-950 to-indigo-950', deco: 'START', decoRight: false, fullWidth: true, Hero: S1Full, Detail: null },
  { id: 'trends', navLabel: 'Your Field', navDesc: 'AI in your role', bg: 'from-slate-950 via-blue-950 to-indigo-950', deco: '8.4', decoRight: true, fullWidth: false, Hero: S2Hero, Detail: S2Detail },
  { id: 'courses', navLabel: 'Courses', navDesc: '15 ranked for you', bg: 'from-emerald-950 via-teal-950 to-green-950', deco: '15', decoRight: false, fullWidth: true, Hero: S3Full, Detail: null },
  { id: 'videos', navLabel: 'Videos', navDesc: 'Beyond the firewall', bg: 'from-rose-950 via-red-950 to-orange-950', deco: '12', decoRight: true, fullWidth: true, Hero: S4Full, Detail: null },
  { id: 'copilot', navLabel: 'Copilot', navDesc: 'Usage & license', bg: 'from-cyan-950 via-sky-950 to-blue-950', deco: '47', decoRight: true, fullWidth: false, Hero: SCopilotHero, Detail: SCopilotDetail },
  { id: 'community', navLabel: 'Community', navDesc: 'People & events', bg: 'from-slate-950 via-teal-950 to-cyan-950', deco: 'SCE', decoRight: false, fullWidth: true, Hero: S5Full, Detail: null },
];

// ─── Story navigation ───────────────────────────────────────────────────────────

function StoryNav({ current, onNavigate }: { current: number; onNavigate: (i: number) => void }) {
  return (
    <nav className="w-full" aria-label="Slide navigation">
      <div className="flex gap-1 sm:gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {STORIES.map((story, i) => {
          const isPast = i < current;
          const isCurrent = i === current;
          return (
            <button
              key={story.id}
              type="button"
              onClick={() => onNavigate(i)}
              aria-current={isCurrent ? 'step' : undefined}
              className={`flex-1 min-w-[4.5rem] sm:min-w-0 text-left rounded-lg px-1.5 sm:px-2 py-1.5 transition-colors group ${
                isCurrent ? 'bg-white/10' : 'hover:bg-white/6'
              }`}
            >
              <div
                className={`h-0.5 rounded-full mb-1.5 transition-all ${
                  isPast ? 'bg-white' : isCurrent ? 'bg-white' : 'bg-white/18 group-hover:bg-white/30'
                }`}
              />
              <p
                className={`text-[10px] sm:text-xs font-bold leading-tight truncate ${
                  isCurrent ? 'text-white' : isPast ? 'text-white/55' : 'text-white/35 group-hover:text-white/50'
                }`}
              >
                {story.navLabel}
              </p>
              <p
                className={`text-[9px] sm:text-[10px] leading-tight mt-0.5 truncate hidden sm:block ${
                  isCurrent ? 'text-white/45' : 'text-white/22 group-hover:text-white/35'
                }`}
              >
                {story.navDesc}
              </p>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function FullPage() {
  const [current, setCurrent] = useState(0);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= STORIES.length) return;
    setCurrent(idx);
    setMobileExpanded(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'ArrowLeft') goTo(current - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, goTo]);

  const story = STORIES[current];
  const { Hero, Detail, fullWidth } = story;

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Crossfading backgrounds */}
      {STORIES.map((s, i) => (
        <div key={s.id} className={`absolute inset-0 bg-gradient-to-br ${s.bg}`}
          style={{ opacity: i === current ? 1 : 0, transition: 'opacity 0.7s ease' }} />
      ))}

      {/* Decorative text */}
      {STORIES.map((s, i) => (
        <div key={s.id} className="absolute pointer-events-none select-none"
          style={{
            opacity: i === current ? 0.045 : 0, transition: 'opacity 0.7s ease',
            fontSize: 'clamp(14rem, 30vw, 26rem)', fontWeight: 900, lineHeight: 1,
            letterSpacing: '-0.04em', color: 'white', bottom: '-2rem',
            right: s.decoRight ? '-1rem' : 'auto', left: s.decoRight ? 'auto' : '-1rem',
          }}
        >{s.deco}</div>
      ))}

      <div className="relative z-10 h-full flex flex-col">
        {/* Top bar */}
        <div className="flex-none px-6 lg:px-10 pt-5 pb-0">
          <StoryNav current={current} onNavigate={goTo} />
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <span className="text-white/45 text-xs font-medium hidden sm:block">Your AI Game Plan · {PERSONA.name}, {PERSONA.role.replace('Senior ', '')}</span>
              <span className="text-white/45 text-xs font-medium sm:hidden">{PERSONA.name.split(' ')[0]} · AI Plan</span>
            </div>
            <span className="text-white/20 text-xs hidden lg:block">← → to navigate</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden relative min-h-0">
          {/* Desktop prev */}
          <button onClick={() => goTo(current - 1)} disabled={current === 0}
            className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/8 border border-white/12 items-center justify-center text-white/40 hover:bg-white/18 hover:text-white transition-all disabled:opacity-0 disabled:pointer-events-none">
            <ChevronLeft size={20} />
          </button>

          {/* Hero */}
          <div className={`flex-1 flex items-stretch overflow-y-auto py-6 ${fullWidth ? 'px-6 lg:px-20 xl:px-24' : 'px-6 lg:pl-24 lg:pr-10'}`}>
            <div key={`hero-${current}`} className="w-full h-full" style={{ animation: 'storyIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards' }}>
              <Hero />
              {!fullWidth && Detail && (
                <div className="lg:hidden mt-5">
                  <button onClick={() => setMobileExpanded(e => !e)}
                    className="flex items-center gap-2 text-sm font-semibold text-white/35 hover:text-white/60 transition-colors mb-3">
                    <Bot size={14} />{mobileExpanded ? 'Hide detail' : 'See more →'}
                  </button>
                  {mobileExpanded && (
                    <div className="rounded-2xl bg-white/8 border border-white/12 p-5 max-h-72 overflow-y-auto">
                      <Detail />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Detail panel — two-panel stories only */}
          {!fullWidth && Detail && (
            <div key={`detail-${current}`} className="hidden lg:flex flex-col w-[460px] xl:w-[500px] flex-shrink-0 my-6 mr-16 overflow-hidden"
              style={{ animation: 'storyIn 0.5s cubic-bezier(0.22,1,0.36,1) 0.08s both' }}>
              <Detail />
            </div>
          )}

          {/* Desktop next */}
          <button onClick={() => goTo(current + 1)} disabled={current === STORIES.length - 1}
            className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/8 border border-white/12 items-center justify-center text-white/40 hover:bg-white/18 hover:text-white transition-all disabled:opacity-20 disabled:pointer-events-none">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Bottom nav */}
        <div className="flex-none flex items-center justify-between lg:justify-center gap-4 px-6 pb-5 pt-2">
          <button onClick={() => goTo(current - 1)} disabled={current === 0}
            className="lg:hidden flex items-center gap-1 px-4 py-2 rounded-full bg-white/10 text-white/65 text-sm font-medium disabled:opacity-20 hover:bg-white/18 transition-colors">
            <ChevronLeft size={15} /> Prev
          </button>
          <div className="flex gap-2 items-center">
            {STORIES.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/25 hover:bg-white/50'}`} />
            ))}
          </div>
          {current < STORIES.length - 1 ? (
            <button onClick={() => goTo(current + 1)}
              className="lg:hidden flex items-center gap-1 px-4 py-2 rounded-full bg-white/10 text-white/65 text-sm font-medium hover:bg-white/18 transition-colors">
              Next <ChevronRight size={15} />
            </button>
          ) : (
            <button onClick={() => goTo(0)}
              className="lg:hidden px-4 py-2 rounded-full bg-white text-gray-900 text-sm font-bold hover:bg-white/90 transition-colors">
              Start over
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes storyIn {
          from { opacity: 0; transform: translateX(18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
