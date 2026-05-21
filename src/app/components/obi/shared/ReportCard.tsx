import { VP_BRIEF } from '../../../../data/obi-intelligence';
import { INTEL } from '../tokens';

export function ReportCard() {
  const text = VP_BRIEF.sections
    .map(s => `${s.heading}\n${s.bullets.join('\n')}`)
    .join('\n\n');

  const handleCopy = () => {
    navigator.clipboard?.writeText(`${VP_BRIEF.title}\n${VP_BRIEF.subtitle}\n\n${text}`);
  };

  return (
    <div
      className="rounded-lg border p-4 mt-3 font-mono text-[11px] leading-relaxed"
      style={{
        backgroundColor: INTEL.bg,
        borderColor: INTEL.border,
        color: INTEL.textBody,
      }}
    >
      <p className="font-bold text-xs mb-0.5 tracking-wide text-white">{VP_BRIEF.title}</p>
      <p
        className="text-[10px] mb-3 pb-3 border-b"
        style={{ color: INTEL.muted, borderColor: INTEL.border }}
      >
        {VP_BRIEF.subtitle}
      </p>
      {VP_BRIEF.sections.map(section => (
        <div key={section.heading} className="mb-3">
          <p className="font-bold text-[10px] uppercase tracking-wider mb-1" style={{ color: INTEL.accentBlue }}>
            {section.heading}
          </p>
          {section.bullets.map((b, i) => (
            <p key={i} className="pl-1" style={{ color: INTEL.muted }}>
              {b}
            </p>
          ))}
        </div>
      ))}
      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t" style={{ borderColor: INTEL.border }}>
        <ActionBtn label="Export PDF" onClick={() => alert('PDF export — prototype')} />
        <ActionBtn label="Copy to clipboard" onClick={handleCopy} />
        <ActionBtn label="Share with team" onClick={() => alert('Share — prototype')} />
      </div>
    </div>
  );
}

function ActionBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded text-[10px] font-semibold border transition-colors hover:opacity-90"
      style={{ borderColor: INTEL.border, color: INTEL.muted }}
    >
      {label}
    </button>
  );
}
