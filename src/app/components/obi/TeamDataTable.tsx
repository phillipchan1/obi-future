import { useMemo, useState } from 'react';
import { Search, Check, Download } from 'lucide-react';
import {
  EMPLOYEES,
  formatEmployeeId,
  LEADER_STATS,
  type ReadinessLevel,
} from '../../../data/dashboard';
import { INTEL } from './tokens';
import { GlassCard } from './shared/glass';
import { LevelPill } from './shared/LevelPill';

const LEVEL_FILTERS: Array<ReadinessLevel | 'All'> = [
  'All', 'Skilled', 'Familiar', 'Learner', 'Beginner',
];

const MAX_COPILOT = Math.max(...EMPLOYEES.map(e => e.copilotUsage));

export function TeamDataTable({
  onAskObi,
  compactHeader,
}: {
  onAskObi?: (prefill: string) => void;
  compactHeader?: boolean;
}) {
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
        e.level.toLowerCase().includes(q);
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
      const delta = e.finalScore - e.firstScore;
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
    <div className="space-y-4">
      {!compactHeader && (
        <p className="text-xs" style={{ color: INTEL.muted }}>
          {filtered.length} of {LEADER_STATS.uniqueCompletions} records
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: INTEL.muted }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search department, title, level..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs outline-none border"
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.1)',
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
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all"
              style={{
                backgroundColor: levelFilter === f ? 'rgba(255,255,255,0.12)' : 'transparent',
                borderColor: 'rgba(255,255,255,0.15)',
                color: levelFilter === f ? INTEL.text : INTEL.muted,
              }}
            >
              {f}
            </button>
          ))}
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border ml-2"
            style={{ borderColor: 'rgba(255,255,255,0.2)', color: INTEL.text }}
          >
            <Download size={12} />
            Export CSV
          </button>
        </div>
      </div>

      <GlassCard className="overflow-x-auto p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              {[
                '#', 'Employee', 'Department', 'Title', 'Day Taken', '1st Score', 'Final Score',
                'Δ Score', 'Level', 'Retook?', 'Copilot Usage', 'Do Now Complete', 'Gap Score',
              ].map(h => (
                <th key={h} className="text-left px-3 py-3 font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: INTEL.muted }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => {
              const delta = e.finalScore - e.firstScore;
              return (
                <tr key={e.id} className="border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <td className="px-3 py-2.5" style={{ color: INTEL.muted }}>{e.id}</td>
                  <td className="px-3 py-2.5 font-medium text-white whitespace-nowrap">{formatEmployeeId(e.id)}</td>
                  <td className="px-3 py-2.5" style={{ color: INTEL.muted }}>{e.department}</td>
                  <td className="px-3 py-2.5" style={{ color: INTEL.muted }}>{e.title}</td>
                  <td className="px-3 py-2.5 text-center" style={{ color: INTEL.muted }}>{e.day}</td>
                  <td className="px-3 py-2.5 text-center" style={{ color: INTEL.muted }}>{e.firstScore}</td>
                  <td className="px-3 py-2.5 text-center font-medium text-white">{e.finalScore}</td>
                  <td className="px-3 py-2.5 text-center font-medium" style={{ color: delta >= 0 ? INTEL.green : INTEL.red }}>
                    {delta > 0 ? `+${delta}` : delta}
                  </td>
                  <td className="px-3 py-2.5"><LevelPill level={e.level} /></td>
                  <td className="px-3 py-2.5 text-center">
                    {e.retook ? <Check size={14} style={{ color: INTEL.green }} className="inline" /> : <span style={{ color: INTEL.muted }}>—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-white">{e.copilotUsage}</span>
                      <div className="w-10 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <div className="h-full rounded-full" style={{ width: `${(e.copilotUsage / MAX_COPILOT) * 100}%`, backgroundColor: INTEL.accentBlue }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: INTEL.muted }}>{e.doNowComplete} of {e.doNowTotal}</td>
                  <td className="px-3 py-2.5 text-center font-medium" style={{ color: e.gapScore > 30 ? INTEL.red : INTEL.text }}>{e.gapScore}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
