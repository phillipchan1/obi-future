import { useState, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, Line, ComposedChart, ResponsiveContainer,
} from 'recharts';
import {
  Bot, Check, Search, Send, PanelRightClose, PanelRight,
  AlertTriangle, BookOpen, Clock,
} from 'lucide-react';
import { useDashboardPersona } from './PersonaPill';
import {
  DASHBOARD_COLORS as C,
  LEADER_STATS,
  READINESS_DIST,
  SCORE_BUCKETS,
  TREND_DATA,
  INTELLIGENCE,
  EMPLOYEES,
  MY_VIEW,
  LEVEL_COLORS,
  type ReadinessLevel,
} from '../../data/dashboard';

// ─── Shared UI ───────────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 ${className}`}
      style={{ backgroundColor: C.card, borderColor: C.border }}
    >
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: C.muted }}>
      {children}
    </p>
  );
}

function StatCard({ value, label, sub }: { value: string; sub: string; label: string }) {
  return (
    <Card>
      <p className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: C.text }}>{value}</p>
      <p className="text-sm font-semibold mt-1" style={{ color: C.text }}>{label}</p>
      <p className="text-xs mt-0.5" style={{ color: C.muted }}>{sub}</p>
    </Card>
  );
}

// ─── Charts ──────────────────────────────────────────────────────────────────

const chartTooltipStyle = {
  backgroundColor: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  color: C.text,
  fontSize: 12,
};

function ReadinessDonut() {
  return (
    <Card className="h-full flex flex-col">
      <CardTitle>Readiness Level Distribution</CardTitle>
      <div className="flex-1 min-h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={READINESS_DIST}
              dataKey="count"
              nameKey="level"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
            >
              {READINESS_DIST.map(entry => (
                <Cell key={entry.level} fill={entry.color} stroke={C.card} strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip contentStyle={chartTooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: C.text }}>n=53</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        {READINESS_DIST.map(d => (
          <div key={d.level} className="flex items-center gap-1.5 text-xs" style={{ color: C.muted }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            {d.level} {d.pct}%
          </div>
        ))}
      </div>
    </Card>
  );
}

function ScoreBarChart() {
  return (
    <Card className="h-full flex flex-col">
      <CardTitle>Score Distribution</CardTitle>
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={SCORE_BUCKETS} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="range" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {SCORE_BUCKETS.map(entry => (
                <Cell key={entry.range} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function TrendLineChart() {
  return (
    <Card>
      <CardTitle>Score & Participation Trend — Days 1–5</CardTitle>
      <div className="h-[240px] sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={TREND_DATA} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              yAxisId="left"
              domain={[50, 80]}
              tick={{ fill: C.muted, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Avg Score', angle: -90, position: 'insideLeft', fill: C.muted, fontSize: 10 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 60]}
              tick={{ fill: C.muted, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Count', angle: 90, position: 'insideRight', fill: C.muted, fontSize: 10 }}
            />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11, color: C.muted }} />
            <Line yAxisId="left" type="monotone" dataKey="avgScore" name="Avg Score" stroke={C.accent} strokeWidth={2} dot={{ r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="cumCompletions" name="Cumulative Completions" stroke={C.green} strokeWidth={2} strokeDasharray="6 4" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="cumRetakers" name="Cumulative Retakers" stroke={C.yellow} strokeWidth={2} strokeDasharray="2 4" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function JourneyTracker() {
  return (
    <Card>
      <CardTitle>Readiness Journey</CardTitle>
      <div className="flex items-center justify-between px-2 sm:px-8 py-4">
        {READINESS_DIST.map((step, i) => (
          <div key={step.level} className="flex flex-col items-center flex-1 relative">
            {i > 0 && (
              <div
                className="absolute right-1/2 top-5 h-0.5 w-full -translate-y-1/2"
                style={{ backgroundColor: C.border, left: '-50%' }}
              />
            )}
            <div
              className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm border-2"
              style={{ backgroundColor: step.color, borderColor: step.color, color: '#fff' }}
            >
              {step.count}
            </div>
            <p className="text-xs font-semibold mt-2 text-center" style={{ color: C.text }}>{step.level}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── AI Chat ─────────────────────────────────────────────────────────────────

type ChatMessage = { role: 'assistant' | 'user'; text: string };

function getCannedResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes('score') || q.includes('average'))
    return `Average final score is ${LEADER_STATS.avgScore} (median ${LEADER_STATS.medianScore}). ${READINESS_DIST.find(d => d.level === 'Skilled')?.count} employees reached Skilled level.`;
  if (q.includes('level') || q.includes('readiness') || q.includes('distribution'))
    return `Distribution: Beginner ${READINESS_DIST[0].pct}%, Learner ${READINESS_DIST[1].pct}%, Familiar ${READINESS_DIST[2].pct}%, Skilled ${READINESS_DIST[3].pct}%. Familiar and Skilled make up 85% of completions.`;
  if (q.includes('retake') || q.includes('re-engage'))
    return `${LEADER_STATS.reengagersCount} of 53 users (${LEADER_STATS.reengagementRatePct}%) retook the assessment. Retake rate peaks on Day 3–4 of rollout.`;
  if (q.includes('trend') || q.includes('day'))
    return `Avg score climbed from 62 on Day 1 to 71.4 by Day 5. Cumulative completions reached 53; retakers grew from 1 to 19 over the same period.`;
  if (q.includes('flag') || q.includes('risk'))
    return `${INTELLIGENCE.flagged.length} employees flagged: high AI disruption roles but low readiness scores. See Intelligence panel for names.`;
  return `I can help with scores, readiness levels, retakes, trends, and flagged employees. Try asking about "average score", "level distribution", or "retake rate".`;
}

function AiChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hi! I can answer questions about scores, levels, retakes, trends, and flagged employees on your team. What would you like to know?',
    },
  ]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(m => [...m, { role: 'user', text }, { role: 'assistant', text: getCannedResponse(text) }]);
    setInput('');
  };

  return (
    <Card className="h-full flex flex-col min-h-[320px]">
      <CardTitle>AI Data Assistant</CardTitle>
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-[200px] max-h-[280px] pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: C.accent }}>
                <Bot size={12} className="text-white" />
              </div>
            )}
            <p
              className="text-xs leading-relaxed rounded-lg px-3 py-2 max-w-[90%]"
              style={{
                backgroundColor: m.role === 'user' ? C.accent : 'rgba(255,255,255,0.06)',
                color: C.text,
              }}
            >
              {m.text}
            </p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-none">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about scores, levels, trends..."
          className="flex-1 rounded-lg px-3 py-2 text-xs border outline-none focus:ring-1"
          style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }}
        />
        <button
          type="button"
          onClick={send}
          className="p-2 rounded-lg transition-colors"
          style={{ backgroundColor: C.accent, color: '#fff' }}
        >
          <Send size={14} />
        </button>
      </div>
    </Card>
  );
}

// ─── Employee Table ──────────────────────────────────────────────────────────

const LEVEL_FILTERS: Array<ReadinessLevel | 'All'> = ['All', 'Skilled', 'Familiar', 'Learner', 'Beginner'];

function LevelBadge({ level }: { level: ReadinessLevel }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ backgroundColor: `${LEVEL_COLORS[level]}22`, color: LEVEL_COLORS[level] }}
    >
      {level}
    </span>
  );
}

function EmployeeTable() {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<ReadinessLevel | 'All'>('All');

  const filtered = useMemo(() => {
    return EMPLOYEES.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.department.toLowerCase().includes(search.toLowerCase());
      const matchLevel = levelFilter === 'All' || e.level === levelFilter;
      return matchSearch && matchLevel;
    });
  }, [search, levelFilter]);

  return (
    <Card className="h-full flex flex-col min-h-[320px]">
      <CardTitle>Employee Assessment Records</CardTitle>
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search employees..."
          className="w-full pl-9 pr-3 py-2 rounded-lg text-xs border outline-none"
          style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }}
        />
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {LEVEL_FILTERS.map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setLevelFilter(f)}
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors"
            style={{
              backgroundColor: levelFilter === f ? C.accent : 'rgba(255,255,255,0.06)',
              color: levelFilter === f ? '#fff' : C.muted,
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto min-h-0 -mx-1">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0" style={{ backgroundColor: C.card }}>
            <tr style={{ color: C.muted }}>
              {['#', 'Employee', 'Dept', 'Title', 'Day', '1st', 'Final', 'Level', 'Retook?'].map(h => (
                <th key={h} className="pb-2 pr-2 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="border-t" style={{ borderColor: C.border, color: C.text }}>
                <td className="py-2 pr-2" style={{ color: C.muted }}>{e.id}</td>
                <td className="py-2 pr-2 font-medium whitespace-nowrap">{e.name}</td>
                <td className="py-2 pr-2 whitespace-nowrap" style={{ color: C.muted }}>{e.department}</td>
                <td className="py-2 pr-2 max-w-[120px] truncate" style={{ color: C.muted }} title={e.title}>{e.title}</td>
                <td className="py-2 pr-2">{e.day}</td>
                <td className="py-2 pr-2">{e.firstScore}</td>
                <td className="py-2 pr-2 font-semibold">{e.finalScore}</td>
                <td className="py-2 pr-2"><LevelBadge level={e.level} /></td>
                <td className="py-2">{e.retook ? <Check size={14} style={{ color: C.green }} /> : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Intelligence Panel ────────────────────────────────────────────────────────

function IntelligencePanel({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const tierTotal = INTELLIGENCE.courseCompletionByTier.doNow +
    INTELLIGENCE.courseCompletionByTier.doLater +
    INTELLIGENCE.courseCompletionByTier.skip;

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="fixed z-30 flex items-center gap-1 px-2 py-3 rounded-l-lg text-xs font-semibold transition-all duration-300"
        style={{
          top: '50%',
          right: open ? 288 : 0,
          transform: 'translateY(-50%)',
          backgroundColor: C.card,
          border: `1px solid ${C.border}`,
          borderRight: 'none',
          color: C.muted,
        }}
      >
        {open ? <PanelRightClose size={14} /> : <PanelRight size={14} />}
        <span className="hidden sm:inline writing-mode-vertical">Intel</span>
      </button>
      <aside
        className="fixed top-0 right-0 h-full w-72 z-20 border-l overflow-y-auto transition-transform duration-300 ease-out pt-20 pb-6 px-4"
        style={{
          backgroundColor: C.card,
          borderColor: C.border,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <p className="text-sm font-bold mb-4" style={{ color: C.text }}>Intelligence</p>

        <section className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: C.muted }}>
            Top roles impacted by AI
          </p>
          {INTELLIGENCE.topDisruptedRoles.map(r => (
            <div key={r.title} className="mb-2 p-2 rounded-lg" style={{ backgroundColor: C.bg }}>
              <p className="text-xs font-semibold" style={{ color: C.text }}>{r.title}</p>
              <p className="text-[10px] mt-0.5" style={{ color: C.muted }}>
                Disruption {r.disruptionScore} · Avg readiness {r.avgReadiness}
              </p>
            </div>
          ))}
        </section>

        <section className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1" style={{ color: C.muted }}>
            <AlertTriangle size={10} style={{ color: C.yellow }} /> High disruption, low readiness
          </p>
          {INTELLIGENCE.flagged.map(f => (
            <div key={f.name} className="mb-2 p-2 rounded-lg border" style={{ backgroundColor: C.bg, borderColor: `${C.yellow}33` }}>
              <p className="text-xs font-semibold" style={{ color: C.text }}>{f.name}</p>
              <p className="text-[10px]" style={{ color: C.muted }}>{f.title} · Score {f.finalScore}</p>
            </div>
          ))}
        </section>

        <section className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: C.muted }}>
            Course completion by tier
          </p>
          {[
            { label: 'Do Now', value: INTELLIGENCE.courseCompletionByTier.doNow, color: C.green },
            { label: 'Do Later', value: INTELLIGENCE.courseCompletionByTier.doLater, color: C.accent },
            { label: 'Skip', value: INTELLIGENCE.courseCompletionByTier.skip, color: C.muted },
          ].map(t => (
            <div key={t.label} className="mb-2">
              <div className="flex justify-between text-[10px] mb-1">
                <span style={{ color: C.muted }}>{t.label}</span>
                <span style={{ color: C.text }}>{t.value}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.bg }}>
                <div className="h-full rounded-full" style={{ width: `${t.value}%`, backgroundColor: t.color }} />
              </div>
            </div>
          ))}
          <p className="text-[10px] mt-1" style={{ color: C.muted }}>Based on {tierTotal}% assigned recommendations started</p>
        </section>

        <section>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: C.muted }}>
            Copilot usage percentiles
          </p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={INTELLIGENCE.copilotPercentiles} layout="vertical" margin={{ left: 4, right: 8 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="range" width={52} tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
                <Bar dataKey="count" fill={C.accent} radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </aside>
    </>
  );
}

// ─── Leader View ─────────────────────────────────────────────────────────────

function LeaderView({ intelOpen }: { intelOpen: boolean }) {
  return (
    <div className={`space-y-4 transition-[margin] duration-300 ${intelOpen ? 'lg:mr-72' : ''}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard value="53" label="Unique Completions" sub="across 23 job titles" />
        <StatCard value="5.3%" label="Completion Rate" sub="Day 5 of rollout" />
        <StatCard value="34%" label="Re-engagement Rate" sub="19 of 53 users returned" />
        <StatCard value="71.4" label="Average Score" sub="Median: 78" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReadinessDonut />
        <ScoreBarChart />
      </div>
      <TrendLineChart />
      <JourneyTracker />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AiChatWidget />
        <EmployeeTable />
      </div>
    </div>
  );
}

// ─── My View ─────────────────────────────────────────────────────────────────

function MyView() {
  const { persona, copilot, weeklyPlan, nextCourse } = MY_VIEW;
  const [done, setDone] = useState<string[]>(['w1']);
  const totalMinutes = copilot.chatCount * copilot.benchmarkMinutesPerChat;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return (
    <div className="space-y-4 max-w-5xl">
      <Card>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h2 className="text-xl font-bold" style={{ color: C.text }}>{persona.name}</h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${LEVEL_COLORS[persona.aiLevel]}22`, color: LEVEL_COLORS[persona.aiLevel] }}>
            {persona.aiLevel}
          </span>
          <span className="text-xs" style={{ color: C.muted }}>Goal: {persona.targetLevel}</span>
        </div>
        <p className="text-sm" style={{ color: C.muted }}>{persona.role} · {persona.department}</p>
        <div className="flex items-end gap-4 mt-4">
          <div>
            <p className="text-4xl font-black" style={{ color: C.text }}>{persona.finalScore}</p>
            <p className="text-xs" style={{ color: C.muted }}>Final score (Day {persona.day})</p>
          </div>
          <div className="pb-1">
            <p className="text-sm" style={{ color: C.muted }}>First attempt: {persona.firstScore}</p>
            <p className="text-sm" style={{ color: C.muted }}>Role exposure: {persona.exposureScore}/10</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardTitle>Your Copilot Usage</CardTitle>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-2xl font-bold" style={{ color: C.text }}>{copilot.chatCount}</p>
              <p className="text-xs" style={{ color: C.muted }}>Chats · {copilot.period}</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: C.accent }}>{copilot.percentile}th</p>
              <p className="text-xs" style={{ color: C.muted }}>Percentile vs {copilot.peerLabel}</p>
            </div>
          </div>
          <p className="text-xs mb-2" style={{ color: C.muted }}>
            Est. time saved: {hours > 0 ? `${hours}h ` : ''}{mins}m ({copilot.chatCount} × {copilot.benchmarkMinutesPerChat} min)
          </p>
          <div className="flex items-end gap-0.5 h-12">
            {copilot.weeklyTrend.map((c, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${(c / Math.max(...copilot.weeklyTrend)) * 100}%`,
                  backgroundColor: C.accent,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>8-Week Plan Progress</CardTitle>
          <p className="text-xs mb-3" style={{ color: C.muted }}>{done.length} of {weeklyPlan.length} complete</p>
          <div className="h-1 rounded-full mb-4 overflow-hidden" style={{ backgroundColor: C.bg }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(done.length / weeklyPlan.length) * 100}%`, backgroundColor: C.green }}
            />
          </div>
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {weeklyPlan.map(item => {
              const checked = done.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDone(d => (checked ? d.filter(x => x !== item.id) : [...d, item.id]))}
                  className="w-full flex gap-2 items-start text-left rounded-lg px-3 py-2 border transition-colors"
                  style={{
                    borderColor: C.border,
                    backgroundColor: checked ? 'rgba(63,185,80,0.1)' : 'transparent',
                  }}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 ${checked ? 'border-transparent' : ''}`}
                    style={{ backgroundColor: checked ? C.green : 'transparent', borderColor: checked ? C.green : C.border }}
                  >
                    {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold" style={{ color: C.muted }}>{item.week}</span>
                    <p className={`text-xs leading-snug ${checked ? 'line-through opacity-50' : ''}`} style={{ color: C.text }}>
                      {item.action}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="border-l-4" style={{ borderLeftColor: C.accent }}>
        <div className="flex gap-3">
          <BookOpen size={20} style={{ color: C.accent }} className="flex-shrink-0" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: C.muted }}>
              Recommended next course
            </p>
            <p className="font-bold text-sm" style={{ color: C.text }}>{nextCourse.title}</p>
            <p className="text-xs mt-1 flex items-center gap-2" style={{ color: C.muted }}>
              <span>{nextCourse.source}</span>
              <Clock size={10} />
              <span>{nextCourse.duration}</span>
            </p>
            <p className="text-xs mt-2 italic" style={{ color: C.muted }}>{nextCourse.reason}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function Dashboard() {
  const persona = useDashboardPersona();
  const [intelOpen, setIntelOpen] = useState(true);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: C.bg, color: C.text }}>
      <header
        className="sticky top-0 z-40 border-b px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4"
        style={{ backgroundColor: C.bg, borderColor: C.border }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0"
            style={{ backgroundColor: C.accent, color: '#fff' }}
          >
            O
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold truncate">Obi — AI Readiness Dashboard</h1>
            <p className="text-[10px] sm:text-xs truncate" style={{ color: C.muted }}>
              {persona === 'leader' ? 'Department rollout · Day 5' : 'Personal readiness view'}
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 relative">
        <AnimatePresence mode="wait">
          {persona === 'leader' ? (
            <motion.div
              key="leader"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <LeaderView intelOpen={intelOpen} />
            </motion.div>
          ) : (
            <motion.div
              key="employee"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <MyView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {persona === 'leader' && (
        <IntelligencePanel open={intelOpen} onToggle={() => setIntelOpen(o => !o)} />
      )}
    </div>
  );
}
