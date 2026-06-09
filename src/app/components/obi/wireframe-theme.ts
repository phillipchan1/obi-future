import type { ReadinessLevel } from '../../../data/dashboard';

/** Paper-prototype palette for concept testing */
export const WF = {
  bg: '#FFFFFF',
  surface: '#FAFAFA',
  border: '#000000',
  borderLight: '#AAAAAA',
  text: '#000000',
  muted: '#666666',
  fill: '#EEEEEE',
  fillActive: '#000000',
  textOnActive: '#FFFFFF',
  hatch: '#F5F5F5',
  font: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
} as const;

export const WF_LEVEL: Record<ReadinessLevel, string> = {
  Beginner: '#FFFFFF',
  Learner: '#CCCCCC',
  Familiar: '#888888',
  Skilled: '#000000',
};

export const WF_LEVEL_STROKE: Record<ReadinessLevel, string> = {
  Beginner: '#000000',
  Learner: '#000000',
  Familiar: '#000000',
  Skilled: '#000000',
};
