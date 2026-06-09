import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { INTEL } from '../tokens';
import { WF } from '../wireframe-theme';

export type FilterOption = {
  value: string;
  label: string;
  count?: number;
};

type MultiSelectFilterProps = {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  wireframe?: boolean;
};

export function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  searchable = false,
  searchPlaceholder = 'Search...',
  wireframe = false,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filteredOptions = query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter(v => v !== value)
        : [...selected, value],
    );
  };

  const selectVisible = () => {
    const visible = new Set(filteredOptions.map(o => o.value));
    const merged = new Set([...selected, ...visible]);
    onChange([...merged]);
  };

  const clear = () => onChange([]);
  const active = selected.length > 0;
  const radius = wireframe ? 'rounded-none' : 'rounded-md';
  const panelRadius = wireframe ? 'rounded-none' : 'rounded-lg';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 ${radius} text-[11px] font-semibold border`}
        style={
          wireframe
            ? {
                borderColor: WF.border,
                color: active ? WF.textOnActive : WF.text,
                background: active ? WF.fillActive : WF.bg,
              }
            : {
                borderColor: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                color: active ? '#fff' : INTEL.muted,
                background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
              }
        }
      >
        {label}
        {active && (
          <span
            className={`px-1.5 py-0.5 ${wireframe ? 'rounded-none border border-white' : 'rounded-full'} text-[9px] font-bold tabular-nums`}
            style={
              wireframe
                ? { background: WF.bg, color: WF.textOnActive }
                : { background: INTEL.accent, color: '#fff' }
            }
          >
            {selected.length}
          </span>
        )}
        <ChevronDown size={11} style={{ transform: open ? 'rotate(180deg)' : undefined, opacity: 0.6 }} />
      </button>

      {open && (
        <div
          className={`absolute top-full left-0 mt-1 z-50 ${panelRadius} border min-w-[220px] max-w-[280px]`}
          style={
            wireframe
              ? { background: WF.bg, borderColor: WF.border, boxShadow: '4px 4px 0 #000' }
              : { background: '#1a103e', borderColor: 'rgba(255,255,255,0.12)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }
          }
        >
          {searchable && (
            <div className="p-2 border-b" style={{ borderColor: wireframe ? WF.border : 'rgba(255,255,255,0.06)' }}>
              <div className="relative">
                <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: wireframe ? WF.muted : INTEL.muted }} />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={`w-full pl-7 pr-2 py-1.5 ${radius} text-[11px] outline-none border`}
                  style={
                    wireframe
                      ? { background: WF.bg, borderColor: WF.border, color: WF.text }
                      : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: INTEL.text }
                  }
                />
              </div>
            </div>
          )}

          <div
            className="flex items-center justify-between px-3 py-1.5 border-b text-[10px]"
            style={{ borderColor: wireframe ? WF.border : 'rgba(255,255,255,0.06)' }}
          >
            <button type="button" onClick={selectVisible} className="font-medium underline" style={{ color: wireframe ? WF.text : INTEL.accentBlue }}>
              Select all
            </button>
            <button type="button" onClick={clear} className="font-medium underline" style={{ color: wireframe ? WF.muted : INTEL.muted }}>
              Clear
            </button>
          </div>

          <div className="max-h-[240px] overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-2 text-[11px]" style={{ color: wireframe ? WF.muted : INTEL.muted }}>
                No matches
              </p>
            ) : (
              filteredOptions.map(opt => {
                const checked = selected.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggle(opt.value)}
                    className="flex items-center gap-2.5 w-full px-3 py-1.5 text-left"
                    style={{ background: wireframe && checked ? WF.fill : undefined }}
                  >
                    <span
                      className={`w-3.5 h-3.5 ${wireframe ? 'rounded-none' : 'rounded'} flex-shrink-0 flex items-center justify-center border`}
                      style={
                        wireframe
                          ? { borderColor: WF.border, background: checked ? WF.fillActive : WF.bg }
                          : { borderColor: checked ? INTEL.accent : 'rgba(255,255,255,0.2)', background: checked ? INTEL.accent : 'transparent' }
                      }
                    >
                      {checked && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4L3.5 6L6.5 2" stroke={wireframe ? '#fff' : '#fff'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="text-[11px] flex-1 truncate" style={{ color: wireframe ? WF.text : checked ? '#fff' : INTEL.muted }}>
                      {opt.label}
                    </span>
                    {opt.count != null && (
                      <span className="text-[10px] tabular-nums flex-shrink-0" style={{ color: wireframe ? WF.muted : 'rgba(255,255,255,0.35)' }}>
                        {opt.count}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type FilterChip = { key: string; label: string; onRemove: () => void };

export function FilterChipRow({
  chips,
  onClearAll,
  wireframe = false,
}: {
  chips: FilterChip[];
  onClearAll: () => void;
  wireframe?: boolean;
}) {
  if (chips.length === 0) return null;

  return (
    <div
      className="flex-none px-5 py-2 flex flex-wrap items-center gap-1.5 border-b"
      style={{ borderColor: wireframe ? WF.border : 'rgba(255,255,255,0.06)' }}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider mr-1" style={{ color: wireframe ? WF.muted : INTEL.muted }}>
        Active
      </span>
      {chips.map(chip => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className={`inline-flex items-center gap-1 px-2 py-0.5 ${wireframe ? 'rounded-none' : 'rounded-full'} text-[10px] font-medium border`}
          style={
            wireframe
              ? { borderColor: WF.border, color: WF.text, background: WF.surface }
              : { borderColor: 'rgba(255,255,255,0.15)', color: INTEL.textBody }
          }
        >
          {chip.label}
          <span style={{ color: wireframe ? WF.muted : INTEL.muted }}>×</span>
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-[10px] font-medium px-2 py-0.5 underline ml-1"
        style={{ color: wireframe ? WF.text : INTEL.red }}
      >
        Clear all
      </button>
    </div>
  );
}
