import { useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Toaster } from 'sonner';
import {
  QUESTION_TRACKER,
  SCENE_META,
} from '../../../../data/readiness-wrapped';
import { AskObiDrawer, useAskObi } from './AskObiDrawer';
import { usePrefersReducedMotion, useStoryNav } from './hooks';
import {
  SceneCover,
  SceneDoing,
  ScenePlan,
  SceneWhere,
} from './scenes';
import { RW, SCENE_ACCENT_STYLES } from './theme';

const rwStyles = `
@keyframes rw-rise {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  @keyframes rw-rise {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
`;

function getChapterColor(isActive: boolean, isPast: boolean) {
  if (isActive) return RW.text;
  if (isPast) return RW.textSecondary;
  return RW.muted;
}

const NAV_CHAPTERS = [
  { label: 'Overview', sceneIndex: 0 },
  ...QUESTION_TRACKER,
] as const;

export function ReadinessWrapped() {
  const { current, visited, goTo, next, prev, isFirst, isLast } = useStoryNav(0);
  const askObi = useAskObi();
  const reducedMotion = usePrefersReducedMotion();
  const meta = SCENE_META[current];
  const accentStyle = SCENE_ACCENT_STYLES[meta.accent];

  const handleAdvance = useCallback(() => {
    if (!isLast && !askObi.open) next();
  }, [isLast, askObi.open, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (askObi.open) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (!isLast) next();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (!isFirst) prev();
      }
    };
    globalThis.window.addEventListener('keydown', onKey);
    return () => globalThis.window.removeEventListener('keydown', onKey);
  }, [askObi.open, isFirst, isLast, next, prev]);

  const trackerIndex = meta.trackerIndex;

  return (
    <>
      <style>{rwStyles}</style>
      <Toaster position="top-center" richColors />

      <div
        className="fixed inset-0 flex flex-col overflow-hidden"
        style={{ backgroundColor: RW.pageBg, fontFamily: RW.font }}
      >
        {/* Accent glow */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${accentStyle.glow}, transparent)`,
            opacity: current === 0 ? 0.6 : 1,
          }}
        />

        <header
          className="relative z-10 flex items-center gap-4 px-4 sm:px-6 py-3 border-b shrink-0"
          style={{ borderColor: RW.border, backgroundColor: 'rgba(249, 249, 247, 0.92)' }}
        >
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            <Sparkles size={18} style={{ color: RW.brandGold }} className="shrink-0" />
            <span
              className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] truncate"
              style={{ color: RW.text }}
            >
              OBI · AI READINESS DASHBOARD
            </span>
          </div>

          <nav
            className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-full px-1 py-0.5"
            aria-label="Dashboard chapters"
            style={{ backgroundColor: 'rgba(255,255,255,0.58)' }}
          >
            {NAV_CHAPTERS.map(chapter => {
              const isActive = current === chapter.sceneIndex;
              const isPast = current > chapter.sceneIndex || visited.has(chapter.sceneIndex);
              return (
                <button
                  key={chapter.label}
                  type="button"
                  onClick={() => goTo(chapter.sceneIndex)}
                  aria-current={isActive ? 'step' : undefined}
                  className="shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 lg:text-xs"
                  style={{
                    color: getChapterColor(isActive, isPast),
                    backgroundColor: isActive ? accentStyle.bg : 'transparent',
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {chapter.label}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={askObi.openGeneral}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ backgroundColor: RW.sidebar, color: '#fff' }}
          >
            Ask Obi
          </button>
        </header>

        {/* Scene content — background click advances */}
        <main
          className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 cursor-default"
        >
          <button
            type="button"
            aria-label="Advance to next chapter"
            disabled={isLast}
            onClick={handleAdvance}
            className="absolute inset-0 z-0 h-full w-full cursor-default disabled:pointer-events-none"
            style={{ backgroundColor: 'transparent' }}
          />
          <div
            key={current}
            className="relative z-10 max-w-6xl mx-auto"
            style={
              reducedMotion
                ? undefined
                : { animation: 'rw-rise 0.45s ease both' }
            }
          >
            {current === 0 && <SceneCover active={current === 0} />}
            {current === 1 && (
              <SceneWhere active={current === 1} onAskInsight={askObi.openFromInsight} />
            )}
            {current === 2 && (
              <SceneDoing active={current === 2} onAskInsight={askObi.openFromInsight} />
            )}
            {current === 3 && (
              <ScenePlan active={current === 3} onAskAction={askObi.openFromAction} />
            )}
          </div>
        </main>

        <footer
          className="relative z-10 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-t shrink-0"
          style={{ borderColor: RW.border, backgroundColor: RW.card }}
        >
          <p className="min-w-0 truncate text-[10px] sm:text-xs" style={{ color: RW.muted }}>
            {trackerIndex === -1 ? 'Overview' : QUESTION_TRACKER[trackerIndex].label}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              disabled={isFirst}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-opacity disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2"
              style={{ borderColor: RW.border, color: RW.textSecondary, backgroundColor: RW.pageBg }}
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <button
              type="button"
              onClick={next}
              disabled={isLast}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2"
              style={{ backgroundColor: RW.sidebar, color: '#fff' }}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      </div>

      <AskObiDrawer open={askObi.open} onClose={askObi.close} context={askObi.context} />
    </>
  );
}
