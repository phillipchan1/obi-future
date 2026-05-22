import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Bot } from 'lucide-react';
import { LEADER_CONTEXT } from '../../../data/obi-intelligence';
import type { ObiTab, ObiView } from './tokens';
import { INTEL } from './tokens';
import { IntelWatermark } from './shared/IntelWatermark';
import { ObiTabNav } from './shared/ObiTabNav';
import { IntelligenceView } from './IntelligenceView';
import { ChatView } from './ChatView';
import { DataView } from './DataView';
import { MyView } from './MyView';

function parseView(params: URLSearchParams): ObiView {
  return params.get('view') === 'employee' ? 'employee' : 'leader';
}

function parseTab(params: URLSearchParams): ObiTab {
  const t = params.get('tab');
  if (t === 'chat' || t === 'data') return t;
  return 'intelligence';
}

export function ObiShell() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = parseView(searchParams);
  const tab = parseTab(searchParams);
  const prefill = searchParams.get('prefill');

  const buildPath = useCallback(
    (v: ObiView, t: ObiTab, chatPrefill?: string) => {
      const p = new URLSearchParams();
      p.set('view', v);
      if (v === 'leader') p.set('tab', t);
      if (chatPrefill) p.set('prefill', chatPrefill);
      return `/dashboard?${p.toString()}`;
    },
    []
  );

  const navigateTo = (v: ObiView, t?: ObiTab) => {
    navigate(buildPath(v, v === 'leader' ? (t ?? tab) : 'intelligence'), { replace: true });
  };

  const goToChat = (chatPrefill?: string) => {
    navigate(buildPath('leader', 'chat', chatPrefill));
  };

  const clearPrefill = () => {
    const p = new URLSearchParams(searchParams);
    p.delete('prefill');
    setSearchParams(p, { replace: true });
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        backgroundColor: INTEL.bg,
        color: INTEL.text,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <style>{`
        @keyframes intelPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes intelGlow {
          0%, 100% { box-shadow: 0 0 12px rgba(255,255,255,0.25); }
          50% { box-shadow: 0 0 24px rgba(255,255,255,0.45); }
        }
        .intel-pulse-dot { animation: intelPulse 2s ease-in-out infinite; }
        .intel-btn-glow { animation: intelGlow 2.5s ease-in-out infinite; }
      `}</style>

      <IntelWatermark />

      <div className="relative z-10 h-full flex flex-col overflow-hidden">
        {/* Full-bleed tab bar — top edge */}
        <ObiTabNav view={view} tab={tab} onNavigate={navigateTo} />

        {view === 'leader' && (
          <header
            className="flex-none px-6 lg:px-10 py-5 border-b"
            style={{ borderColor: INTEL.border, backgroundColor: INTEL.bg }}
          >
            <div className="max-w-6xl mx-auto flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: INTEL.accent }}
              >
                <Bot size={20} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold" style={{ color: INTEL.text }}>
                  Obi — Company Intelligence
                </h1>
                <p className="text-sm mt-1" style={{ color: INTEL.muted }}>
                  {LEADER_CONTEXT.leaderName} · {LEADER_CONTEXT.title} ·{' '}
                  {LEADER_CONTEXT.companyEmployeeCount.toLocaleString()} company-wide ·{' '}
                  {LEADER_CONTEXT.benchmarkLabel}
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
              </div>
            </div>
          </header>
        )}

        <main
          className="flex-1 overflow-y-auto px-6 lg:px-10 py-8 min-h-0"
          style={{ backgroundColor: INTEL.bg }}
        >
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {view === 'employee' ? (
                <motion.div
                  key="employee"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MyView />
                </motion.div>
              ) : tab === 'intelligence' ? (
                <motion.div
                  key="intelligence"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <IntelligenceView
                    onExploreChat={p => goToChat(p)}
                    onSendAndOpenChat={p => goToChat(p)}
                  />
                </motion.div>
              ) : tab === 'chat' ? (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChatView
                    prefill={prefill}
                    onPrefillConsumed={clearPrefill}
                    showDemo={!prefill}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="data"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DataView onAskInChat={p => goToChat(p)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
