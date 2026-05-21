import { Bot } from 'lucide-react';
import type { ObiResponse } from '../../../../data/obi-intelligence';
import { INTEL } from '../tokens';
import { ReportCard } from './ReportCard';

export function ObiMessage({
  response,
  onFollowUp,
}: {
  response: ObiResponse;
  onFollowUp: (text: string) => void;
}) {
  return (
    <div className="flex gap-3 max-w-3xl">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: INTEL.accent }}
      >
        <Bot size={16} className="text-white" />
      </div>
      <div
        className="flex-1 rounded-2xl px-4 py-3 text-sm border"
        style={{
          backgroundColor: INTEL.surface,
          borderColor: INTEL.border,
          color: INTEL.text,
        }}
      >
        <p className="font-bold mb-2">{response.summary}</p>
        <ul className="space-y-1 mb-3 text-xs" style={{ color: INTEL.textBody }}>
          {response.internal.map((line, i) => (
            <li key={i}>· {line}</li>
          ))}
        </ul>
        <p className="text-xs mb-1" style={{ color: INTEL.muted }}>
          {response.research.text}{' '}
          <span className="italic">[{response.research.citation}]</span>
        </p>
        <p className="text-xs font-medium mt-3 mb-3" style={{ color: INTEL.green }}>
          → {response.action}
        </p>
        {response.showReport && <ReportCard />}
        <div className="flex flex-wrap gap-2 mt-3">
          {response.followUps.map(fu => (
            <button
              key={fu}
              type="button"
              onClick={() => onFollowUp(fu)}
              className="px-2.5 py-1 rounded-full text-[10px] border transition-colors hover:opacity-90"
              style={{ borderColor: INTEL.border, color: INTEL.accentBlue }}
            >
              {fu}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p
        className="text-sm rounded-2xl px-4 py-2 max-w-[85%] border"
        style={{
          backgroundColor: INTEL.surface,
          borderColor: INTEL.border,
          color: INTEL.text,
        }}
      >
        {text}
      </p>
    </div>
  );
}
