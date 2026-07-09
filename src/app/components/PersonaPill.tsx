import { useLocation, useNavigate } from 'react-router';

export type PersonaView = 'gameplan' | 'companyIntel' | 'readinessWrapped' | 'readinessVertical' | 'employee';

export function getActivePersonaView(pathname: string, search: string): PersonaView {
  if (pathname === '/full' || pathname === '/') return 'gameplan';
  if (pathname === '/readiness-wrapped') return 'readinessWrapped';
  if (pathname === '/readiness-vertical') return 'readinessVertical';
  if (pathname === '/intelligence' || pathname.startsWith('/intelligence/')) return 'companyIntel';
  if (pathname === '/dashboard') {
    const params = new URLSearchParams(search);
    return params.get('view') === 'employee' ? 'employee' : 'companyIntel';
  }
  return 'gameplan';
}

const PILLS: { id: PersonaView; label: string }[] = [
  { id: 'gameplan', label: 'Game Plan' },
  { id: 'companyIntel', label: 'Super Leader' },
  { id: 'readinessWrapped', label: 'AI Readiness' },
  { id: 'readinessVertical', label: 'AI Readiness - Vertical' },
  { id: 'employee', label: 'My View' },
];

/** Fixed prototype nav — ghosted until hovered. */
export function PersonaPill() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const active = getActivePersonaView(pathname, search);

  const go = (view: PersonaView) => {
    if (view === 'gameplan') navigate('/full');
    else if (view === 'employee') navigate('/dashboard?view=employee');
    else if (view === 'readinessWrapped') navigate('/readiness-wrapped');
    else if (view === 'readinessVertical') navigate('/readiness-vertical');
    else navigate('/intelligence/org-tree');
  };

  return (
    <div
      className="group fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-1 pointer-events-auto opacity-[0.22] hover:opacity-90 focus-within:opacity-90 transition-opacity duration-300"
      aria-label="Prototype view switcher"
    >
      <span className="text-[8px] font-medium uppercase tracking-widest text-white/30 group-hover:text-white/50 px-1 transition-colors">
        proto
      </span>
      <div
        className="flex rounded-full p-0.5 border"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        {PILLS.map(p => {
          const isActive = active === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => go(p.id)}
              className="px-2.5 py-1.5 rounded-full text-[10px] font-medium transition-all whitespace-nowrap"
              style={{
                backgroundColor: isActive ? 'rgba(46, 117, 182, 0.45)' : 'transparent',
                color: isActive ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 255, 255, 0.35)',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function useDashboardPersona(): 'leader' | 'employee' {
  const { search } = useLocation();
  return new URLSearchParams(search).get('view') === 'employee' ? 'employee' : 'leader';
}
