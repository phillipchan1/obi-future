import type { ObiTab, ObiView } from '../tokens';
import { INTEL } from '../tokens';

const TABS: {
  id: ObiTab | 'myview';
  view: ObiView;
  tab?: ObiTab;
  label: string;
  subtitle: string;
}[] = [
  { id: 'intelligence', view: 'leader', tab: 'intelligence', label: 'Super Leader Dashboard', subtitle: 'Org readiness overview' },
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
    <nav
      className="w-full flex-shrink-0"
      style={{ backgroundColor: INTEL.tabBar, minHeight: '72px' }}
      aria-label="Super Leader Dashboard views"
    >
      <div className="flex w-full h-full min-h-[72px]">
        {TABS.map(item => {
          const active = isActive(item);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.view, item.tab)}
              className="flex-1 flex flex-col justify-center px-4 sm:px-6 transition-colors duration-200 min-w-0 text-left"
              style={{
                borderBottom: active ? `2px solid ${INTEL.text}` : '2px solid transparent',
                backgroundColor: 'transparent',
              }}
            >
              <span
                className="truncate"
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: active ? INTEL.text : INTEL.muted,
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </span>
              <span
                className="truncate mt-1"
                style={{
                  fontSize: '12px',
                  fontWeight: 400,
                  color: INTEL.muted,
                  lineHeight: 1.2,
                  opacity: active ? 1 : 0.85,
                }}
              >
                {item.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
