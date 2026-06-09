import { useMemo, useState } from 'react';
import { Search, Check, Download } from 'lucide-react';
import {
  EMPLOYEES,
  formatEmployeeId,
  type ReadinessLevel,
} from '../../../data/dashboard';
import { DATA_CHAT_PREFILL } from '../../../data/obi-intelligence';
import { INTEL } from './tokens';
import { HeroText, HeroSubtext, IntelTag, ChatCta } from './shared/intelUi';
import { LevelPill } from './shared/LevelPill';

const LEVEL_FILTERS: Array<ReadinessLevel | 'All'> = [
  'All', 'Skilled', 'Familiar', 'Learner', 'Beginner',
];

const MAX_COPILOT = Math.max(...EMPLOYEES.map(e => e.copilotUsage));

export function DataView({ onAskInChat }: { onAskInChat: (prefill: string) => void }) {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<ReadinessLevel | 'All'>('All');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return EMPLOYEES.filter(e => {
      const matchSearch =
        !q ||
        e.department.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        formatEmployeeId(e.id).toLowerCase().includes(q) ||
        e.level?.toLowerCase().includes(q);
      const matchLevel = levelFilter === 'All' || e.level === levelFilter;
      return matchSearch && matchLevel;
    });
  }, [search, levelFilter]);

  const exportCsv = () => {
    const headers = [
      '#', 'Employee', 'Department', 'Title', 'Day Taken', '1st Score', 'Final Score',
      'Delta', 'Level', 'Retook', 'Copilot Usage', 'Do Now Complete', 'Gap Score',
    ];
    const rows = filtered.map(e => {
      const delta = e.finalScore != null && e.firstScore != null ? e.finalScore - e.firstScore : null;
      return [
        e.id,
        formatEmployeeId(e.id),
        e.department,
        e.title,
        e.day,
        e.firstScore,
        e.finalScore,
        delta,
        e.level,
        e.retook ? 'Yes' : '',
        e.copilotUsage,
        `${e.doNowComplete} of ${e.doNowTotal}`,
        e.gapScore,
      ];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'obi-team-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <HeroText>Your team. Every record.</HeroText>
        <HeroSubtext>
          Filtered, sortable, exportable. Names anonymized — departments and roles visible.
        </HeroSubtext>
      </div>

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: INTEL.muted }}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search department, title, level..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs outline-none"
            style={{
              backgroundColor: INTEL.surface,
              border: `1px solid ${INTEL.border}`,
              color: INTEL.text,
            }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          {LEVEL_FILTERS.map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setLevelFilter(f)}
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all duration-200"
              style={{
                backgroundColor: levelFilter === f ? 'rgba(255,255,255,0.15)' : 'transparent',
                borderColor: INTEL.border,
                color: levelFilter === f ? INTEL.text : INTEL.muted,
              }}
            >
              {f}
            </button>
          ))}
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border ml-2 transition-colors hover:bg-white/5"
            style={{ borderColor: INTEL.border, color: INTEL.text }}
          >
            <Download size={12} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: INTEL.border }}>
        <table className="w-full text-xs" style={{ backgroundColor: INTEL.surface }}>
          <thead>
            <tr className="border-b" style={{ borderColor: INTEL.border }}>
              {[
                '#', 'Employee', 'Department', 'Title', 'Day Taken', '1st Score', 'Final Score',
                'Δ Score', 'Level', 'Retook?', 'Copilot Usage', 'Do Now Complete', 'Gap Score',
              ].map(h => (
                <th
                  key={h}
                  className="text-left px-3 py-3 font-semibold uppercase tracking-wider whitespace-nowrap"
                  style={{ color: INTEL.muted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => {
              const delta = e.finalScore != null && e.firstScore != null ? e.finalScore - e.firstScore : null;
              return (
                <tr
                  key={e.id}
                  className="border-b transition-colors hover:bg-white/[0.03]"
                  style={{ borderColor: INTEL.border }}
                >
                  <td className="px-3 py-2.5" style={{ color: INTEL.muted }}>{e.id}</td>
                  <td className="px-3 py-2.5 font-medium whitespace-nowrap text-white">
                    {formatEmployeeId(e.id)}
                  </td>
                  <td className="px-3 py-2.5" style={{ color: INTEL.muted }}>{e.department}</td>
                  <td className="px-3 py-2.5" style={{ color: INTEL.muted }}>{e.title}</td>
                  <td className="px-3 py-2.5 text-center" style={{ color: INTEL.muted }}>{e.day}</td>
                  <td className="px-3 py-2.5 text-center" style={{ color: INTEL.muted }}>{e.firstScore}</td>
                  <td className="px-3 py-2.5 text-center font-medium text-white">{e.finalScore}</td>
                  <td
                    className="px-3 py-2.5 text-center font-medium"
                    style={{ color: delta >= 0 ? INTEL.green : INTEL.red }}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </td>
                  <td className="px-3 py-2.5">
                    <LevelPill level={e.level} />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {e.retook ? (
                      <Check size={14} className="inline" style={{ color: INTEL.green }} />
                    ) : (
                      <span style={{ color: INTEL.muted }}>—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-[72px]">
                      <span className="text-white">{e.copilotUsage}</span>
                      <div
                        className="flex-1 h-1 rounded-full overflow-hidden max-w-[40px]"
                        style={{ backgroundColor: INTEL.bg }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(e.copilotUsage / MAX_COPILOT) * 100}%`,
                            backgroundColor: INTEL.accent,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: INTEL.muted }}>
                    {e.doNowComplete} of {e.doNowTotal}
                  </td>
                  <td
                    className="px-3 py-2.5 text-center font-medium"
                    style={{ color: e.gapScore > 30 ? INTEL.red : INTEL.text }}
                  >
                    {e.gapScore}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-center py-8">
        <p className="text-sm italic" style={{ color: INTEL.muted }}>
          Want Obi to analyze this for you?
        </p>
        <div className="mt-2">
          <ChatCta onClick={() => onAskInChat(DATA_CHAT_PREFILL)}>Ask in Chat →</ChatCta>
        </div>
      </div>
    </div>
  );
}
