import { useCallback, useEffect, useState } from 'react';
import { SCENE_COUNT } from '../../../../data/readiness-wrapped';

export function useStoryNav(initial = 0) {
  const [current, setCurrent] = useState(initial);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([initial]));

  const goTo = useCallback((index: number) => {
    const next = Math.max(0, Math.min(SCENE_COUNT - 1, index));
    setCurrent(next);
    setVisited(prev => new Set(prev).add(next));
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  return { current, visited, goTo, next, prev, isFirst: current === 0, isLast: current === SCENE_COUNT - 1 };
}

export function useCountUp(target: number, active: boolean, duration = 1200) {
  const [value, setValue] = useState(0);
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    if (reducedMotion) {
      setValue(target);
      return;
    }
    let start: number | null = null;
    let frame: number;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration, reducedMotion]);

  return value;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}
