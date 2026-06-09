import type { ObiTab, ObiView } from '../tokens';

const LEADER_TABS: { id: ObiTab; label: string }[] = [
  { id: 'intelligence', label: 'Super Leader Dashboard' },
  { id: 'chat', label: 'Chat' },
  { id: 'data', label: 'Data' },
];

export function ObiNavPills({
  view,
  tab,
  onViewChange,
  onTabChange,
}: {
  view: ObiView;
  tab: ObiTab;
  onViewChange: (v: ObiView) => void;
  onTabChange: (t: ObiTab) => void;
}) {
  return (
    <div className="flex rounded-full p-0.5 border border-white/12 bg-white/8 backdrop-blur-xl flex-shrink-0">
      <Pill
        active={view === 'employee'}
        label="My View"
        onClick={() => onViewChange('employee')}
      />
      {LEADER_TABS.map(t => (
        <Pill
          key={t.id}
          active={view === 'leader' && tab === t.id}
          label={t.label}
          onClick={() => {
            onViewChange('leader');
            onTabChange(t.id);
          }}
        />
      ))}
    </div>
  );
}

function Pill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 whitespace-nowrap"
      style={{
        backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent',
        color: active ? '#fff' : 'rgba(255,255,255,0.45)',
      }}
    >
      {label}
    </button>
  );
}
