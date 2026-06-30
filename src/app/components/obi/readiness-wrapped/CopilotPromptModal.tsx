import { useEffect } from 'react';
import { ExternalLink, Copy, X } from 'lucide-react';
import { toast } from 'sonner';
import { RW } from './theme';

type CopilotPromptModalProps = Readonly<{
  open: boolean;
  title: string;
  subtitle: string;
  prompt: string;
  onClose: () => void;
}>;

export function CopilotPromptModal({
  open,
  title,
  subtitle,
  prompt,
  onClose,
}: CopilotPromptModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    globalThis.window.addEventListener('keydown', onKey);
    return () => globalThis.window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt).then(() => {
      toast.success('Prompt copied');
    });
  };

  const openCopilot = () => {
    globalThis.window.open('https://copilot.microsoft.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[120] bg-black/25 backdrop-blur-[2px]"
        aria-hidden
        onClick={e => {
          e.stopPropagation();
          onClose();
        }}
      />
      <dialog
        open
        aria-label={title}
        className="fixed z-[130] left-1/2 top-1/2 m-0 flex max-h-[82vh] w-[calc(100vw-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border-0 p-0 shadow-2xl outline-none"
        style={{ backgroundColor: RW.card, border: `1px solid ${RW.border}` }}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b px-6 py-5" style={{ borderColor: RW.border }}>
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: RW.purpleText }}>
              Copilot prompt preview
            </p>
            <h2 className="text-lg font-semibold leading-snug" style={{ color: RW.text }}>
              {title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: RW.textSecondary }}>
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close prompt preview"
            className="shrink-0 rounded-lg p-1.5 transition-colors hover:bg-black/5"
          >
            <X size={18} style={{ color: RW.muted }} />
          </button>
        </header>

        <div className="min-h-0 flex-1 px-6 py-5">
          <label htmlFor="copilot-prompt-preview" className="mb-2 block text-[10px] font-semibold uppercase tracking-wide" style={{ color: RW.muted }}>
            Prompt that will be copied
          </label>
          <textarea
            id="copilot-prompt-preview"
            readOnly
            value={prompt}
            className="block h-[min(44vh,380px)] w-full resize-none rounded-xl border p-4 font-mono text-[11px] leading-relaxed outline-none"
            style={{ backgroundColor: RW.pageBg, borderColor: RW.border, color: RW.textSecondary }}
          />
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: RW.border }}>
            <p className="max-w-md text-xs leading-relaxed" style={{ color: RW.muted }}>
              This prompt is pre-populated with the dashboard data, so leaders can see what gets passed to Copilot.
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={copyPrompt}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-opacity hover:opacity-90"
                style={{ color: RW.purpleText, borderColor: RW.purpleBorder, backgroundColor: RW.purpleBg }}
              >
                <Copy size={14} />
                Copy prompt
              </button>
              <button
                type="button"
                onClick={openCopilot}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-opacity hover:opacity-90"
                style={{ color: '#fff', backgroundColor: RW.sidebar }}
              >
                Open Copilot
                <ExternalLink size={14} />
              </button>
            </div>
        </footer>
      </dialog>
    </>
  );
}
