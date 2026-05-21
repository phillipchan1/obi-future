import type { ObiTab, ObiView } from '../tokens';
import { INTEL } from '../tokens';

const TABS: {
  id: ObiTab | 'myview';
  view: ObiView;
  tab?: ObiTab;
  label: string;
  subtitle: string;
}[] = [
  { id: 'intelligence', view: 'leader', tab: 'intelligence', label: 'Intelligence', subtitle: "Obi's briefing" },
  { id: 'chat', view: 'leader', tab: 'chat', label: 'Chat', subtitle: 'Ask anything' },
  { id: 'data', view: 'leader', tab: 'data', label: 'Data', subtitle: 'Raw records' },
  { id: 'myview', view: 'employee', label: 'My View', subtitle: 'Your journey' },
];

export function ObiTabNav({
  view,
  tab,
  onNavigate,
}: {
  view: ObiView;
  tab: ObiTab;
  onNavigate: (v: ObiView, t?: ObiTab) => void;
}) {
  const isActive = (item: (typeof TABS)[0]) => {
    if (item.view === 'employee') return view === 'employee';
    return view === 'leader' && tab === item.tab;
  };

  return (
    <nav className="w-full border-b" style={{ borderColor: INTEL.border }} aria-label="Intelligence views">
      <div className="flex">
        {TABS.map(item => {
          const active = isActive(item);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.view, item.tab)}
              className="flex-1 text-left px-3 sm:px-4 py-3 transition-colors duration-200 min-w-0"
              style={{
                borderBottom: active ? `2px solid ${INTEL.text}` : '2px solid transparent',
              }}
            >
              <p
                className="text-xs sm:text-sm font-bold truncate"
                style={{ color: active ? INTEL.text : INTEL.muted }}
              >
                {item.label}
              </p>
              <p
                className="text-[10px] sm:text-[11px] truncate mt-0.5 hidden sm:block"
                style={{ color: active ? INTEL.muted : `${INTEL.muted}99` }}
              >
                {item.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
