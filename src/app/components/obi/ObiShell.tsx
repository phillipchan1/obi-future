import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Bot, Sparkles, FileText } from 'lucide-react';
import { LEADER_CONTEXT } from '../../../data/obi-intelligence';
import type { ObiView } from './tokens';
import { INTEL } from './tokens';
import { ZONES } from './shared/glass';
import { CompanyBriefing } from './CompanyBriefing';
import { EmployeeBriefing } from './EmployeeBriefing';
import { FocusMode } from './FocusMode';
import { Zone3ChatPanel } from './Zone3ChatPanel';

function parseView(params: URLSearchParams): ObiView {
  return params.get('view') === 'employee' ? 'employee' : 'leader';
}

export function ObiShell() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = parseView(searchParams);
  const focusMode = searchParams.get('mode') === 'focus';
  const urlPrefill = searchParams.get('prefill');
  const [chatExpanded, setChatExpanded] = useState(false);

  const setFocusMode = useCallback(
    (on: boolean) => {
      const p = new URLSearchParams(searchParams);
      if (on) p.set('mode', 'focus');
      else p.delete('mode');
      setSearchParams(p, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const [localPrefill, setLocalPrefill] = useState<string | null>(null);
  const prefill = localPrefill ?? urlPrefill;

  const onAskObi = useCallback((text: string) => {
    setLocalPrefill(text);
    setChatExpanded(true);
  }, []);

  const clearPrefill = useCallback(() => {
    setLocalPrefill(null);
    const p = new URLSearchParams(searchParams);
    if (p.has('prefill')) {
      p.delete('prefill');
      setSearchParams(p, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const legacyTab = searchParams.get('tab');
    if (!legacyTab || view !== 'leader') return;
    const p = new URLSearchParams(searchParams);
    p.delete('tab');
    if (legacyTab === 'chat') setChatExpanded(true);
    navigate(`/dashboard?${p.toString()}`, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        color: INTEL.text,
        fontFamily: 'Inter, system-ui, sans-serif',
        backgroundColor: ZONES.zone1,
      }}
    >
      <style>{`
        @keyframes intelPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        .intel-pulse-dot { animation: intelPulse 2s ease-in-out infinite; }
      `}</style>

      <header
        className="flex-none px-6 lg:px-10 py-5 border-b z-20"
        style={{
          borderColor: 'rgba(255,255,255,0.1)',
          background: 'rgba(26, 10, 62, 0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: INTEL.accent }}
          >
            <Bot size={20} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold" style={{ color: INTEL.text }}>
                Obi — Company Intelligence
              </h1>
              {view === 'leader' && (
                <div
                  className="flex items-center rounded-full border p-0.5 flex-shrink-0"
                  style={{
                    borderColor: 'rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.04)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setFocusMode(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background: !focusMode ? 'rgba(255,255,255,0.12)' : 'transparent',
                      color: !focusMode ? '#FFFFFF' : INTEL.muted,
                    }}
                  >
                    <FileText size={12} />
                    Briefing
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocusMode(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background: focusMode ? 'rgba(107, 70, 193, 0.4)' : 'transparent',
                      color: focusMode ? '#FFFFFF' : INTEL.muted,
                    }}
                  >
                    <Sparkles size={12} />
                    Focus Mode
                  </button>
                </div>
              )}
            </div>
            {view === 'leader' && (
              <>
                <p className="text-sm mt-1" style={{ color: INTEL.muted }}>
                  {LEADER_CONTEXT.leaderName} · {LEADER_CONTEXT.title} ·{' '}
                  {LEADER_CONTEXT.companyEmployeeCount.toLocaleString()} company-wide
                </p>
                <p className="text-xs mt-2 flex flex-wrap gap-1">
                  <span style={{ color: INTEL.accentBlue }}>{LEADER_CONTEXT.scopeLabel}</span>
                  <span style={{ color: INTEL.muted }}>·</span>
                  <span style={{ color: INTEL.accentBlue }}>{LEADER_CONTEXT.department}</span>
                  <span style={{ color: INTEL.muted }}>·</span>
                  <span style={{ color: INTEL.accentBlue }}>
                    {LEADER_CONTEXT.departmentAssessed} assessed in scope
                  </span>
                </p>
              </>
            )}
            {view === 'employee' && (
              <p className="text-sm mt-1" style={{ color: INTEL.muted }}>
                My View · personal readiness briefing
              </p>
            )}
          </div>
        </div>
      </header>

      <main
        className="flex-1 overflow-y-auto min-h-0"
        style={{ paddingBottom: chatExpanded ? '50vh' : '56px' }}
      >
        {view === 'employee' ? (
          <EmployeeBriefing onAskObi={onAskObi} />
        ) : focusMode ? (
          <FocusMode onAskObi={onAskObi} onExit={() => setFocusMode(false)} />
        ) : (
          <CompanyBriefing onAskObi={onAskObi} />
        )}
      </main>

      {!chatExpanded && (
        <button
          type="button"
          onClick={() => setChatExpanded(true)}
          className="fixed z-[55] px-4 py-2 rounded-full text-xs font-semibold border shadow-lg transition-transform hover:scale-105"
          style={{
            bottom: '5.5rem',
            right: '1.25rem',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(255,255,255,0.15)',
            color: INTEL.text,
          }}
        >
          Ask Obi ↑
        </button>
      )}

      <Zone3ChatPanel
        expanded={chatExpanded}
        onToggle={() => setChatExpanded(e => !e)}
        prefill={prefill}
        onPrefillConsumed={clearPrefill}
        mode={view}
      />
    </div>
  );
}
