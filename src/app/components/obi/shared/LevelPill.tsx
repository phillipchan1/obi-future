import type { ReadinessLevel } from '../../../../data/dashboard';
import { LEVEL_COLORS } from '../../../../data/dashboard';

export function LevelPill({ level }: { level: ReadinessLevel }) {
  const color = LEVEL_COLORS[level];
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: `${color}33`, color }}
    >
      {level}
    </span>
  );
}
