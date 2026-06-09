import { useState, useRef, useEffect } from 'react';
import { Columns3 } from 'lucide-react';
import { INTEL } from '../tokens';
import { WF } from '../wireframe-theme';

export type ColumnOption = {
  id: string;
  label: string;
  preview?: boolean;
  defaultVisible: boolean;
};

type ColumnPickerProps = {
  columns: ColumnOption[];
  visible: Set<string>;
  onToggle: (id: string) => void;
  wireframe?: boolean;
};

export function ColumnPicker({ columns, visible, onToggle, wireframe = false }: ColumnPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hiddenCount = columns.filter(c => !visible.has(c.id)).length;
  const radius = wireframe ? 'rounded-none' : 'rounded-lg';

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 ${radius} text-xs font-medium border`}
        style={
          wireframe
            ? { borderColor: WF.border, color: WF.text, background: WF.bg }
            : {
                borderColor: hiddenCount > 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                color: hiddenCount > 0 ? '#fff' : INTEL.muted,
              }
        }
      >
        <Columns3 size={13} />
        Columns
        {hiddenCount > 0 && (
          <span
            className={`px-1.5 py-0.5 ${wireframe ? 'rounded-none border border-black' : 'rounded-full'} text-[9px] font-bold tabular-nums`}
            style={wireframe ? { background: WF.fill, color: WF.text } : { background: 'rgba(255,255,255,0.12)', color: INTEL.muted }}
          >
            {visible.size}/{columns.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute top-full right-0 mt-1 z-50 ${radius} border min-w-[240px] py-1`}
          style={
            wireframe
              ? { background: WF.bg, borderColor: WF.border, boxShadow: '4px 4px 0 #000' }
              : { background: '#1a103e', borderColor: 'rgba(255,255,255,0.12)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }
          }
        >
          <p
            className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider border-b"
            style={{ color: wireframe ? WF.muted : INTEL.muted, borderColor: wireframe ? WF.border : 'rgba(255,255,255,0.06)' }}
          >
            Show columns
          </p>
          {columns.map(col => {
            const checked = visible.has(col.id);
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => onToggle(col.id)}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-left"
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
                      <path d="M1.5 4L3.5 6L6.5 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="text-[11px] flex-1" style={{ color: wireframe ? WF.text : checked ? '#fff' : INTEL.muted }}>
                  {col.label}
                </span>
                {col.preview && (
                  <span
                    className={`text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 border ${wireframe ? 'rounded-none' : 'rounded'}`}
                    style={
                      wireframe
                        ? { borderColor: WF.border, color: WF.text, background: WF.surface }
                        : { background: 'rgba(210,153,34,0.2)', color: INTEL.yellow }
                    }
                  >
                    Preview
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
