import type { ReadinessLevel } from '../../../data/dashboard';
import type { CSSProperties } from 'react';

/** Paper-prototype palette — low-fidelity but readable contrast hierarchy */
export const WF = {
  bg: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF0F3',
  border: '#DDE1E6',
  borderStrong: '#C4C9D0',
  borderLight: '#EEF0F2',
  text: '#1D1D1F',
  textSecondary: '#48484A',
  muted: '#86868B',
  fill: '#F1F3F5',
  fillHover: '#E8EBEF',
  fillActive: '#2C2C2E',
  textOnActive: '#FFFFFF',
  accent: '#3A3A3C',
  accentSoft: '#E3E6EA',
  hatch: '#F5F6F8',
  font: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  shadowSm: '0 1px 2px rgba(0, 0, 0, 0.04)',
  shadowMd: '0 2px 8px rgba(0, 0, 0, 0.06)',
} as const;

export const WF_LEVEL: Record<ReadinessLevel, string> = {
  Beginner: '#FFFFFF',
  Learner: '#E5E5EA',
  Familiar: '#AEAEB2',
  Skilled: '#3A3A3C',
};

export const WF_LEVEL_STROKE: Record<ReadinessLevel, string> = {
  Beginner: WF.borderStrong,
  Learner: WF.borderStrong,
  Familiar: WF.borderStrong,
  Skilled: WF.borderStrong,
};

/** CSS variables for scoped wireframe shell overrides */
export const WF_CSS_VARS: CSSProperties = {
  ['--wf-border' as string]: WF.border,
  ['--wf-border-strong' as string]: WF.borderStrong,
  ['--wf-text' as string]: WF.text,
  ['--wf-muted' as string]: WF.muted,
  ['--wf-bg' as string]: WF.bg,
  ['--wf-surface' as string]: WF.surface,
};

export const wfCardStyle: CSSProperties = {
  background: WF.surface,
  border: `1px solid ${WF.border}`,
  boxShadow: WF.shadowSm,
};

export const wfSectionStyle: CSSProperties = {
  background: WF.surfaceMuted,
  borderBottom: `1px solid ${WF.border}`,
};

export const wfTabActiveStyle: CSSProperties = {
  background: WF.surface,
  color: WF.text,
  borderColor: WF.borderStrong,
  borderBottomColor: WF.fillActive,
  boxShadow: WF.shadowSm,
};

export const wfTabInactiveStyle: CSSProperties = {
  background: 'transparent',
  color: WF.muted,
  borderColor: 'transparent',
};
