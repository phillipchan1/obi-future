import type { ReadinessLevel } from '../../../data/dashboard';
import type { CSSProperties } from 'react';

/** Light executive dashboard palette — colored, presentation-ready */
export const WF = {
  bg: '#F4F5F7',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF0F4',
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
  borderLight: '#F3F4F6',
  text: '#111827',
  textSecondary: '#4B5563',
  muted: '#9CA3AF',
  fill: '#F3F4F6',
  fillHover: '#E5E7EB',
  fillActive: '#4F46E5',
  textOnActive: '#FFFFFF',
  accent: '#4F46E5',
  accentSoft: '#EEF2FF',
  purple: '#7C5CFC',
  purpleSoft: '#F3F0FF',
  purpleBorder: '#DDD6FE',
  green: '#16A34A',
  greenSoft: '#F0FDF4',
  red: '#E11D48',
  redSoft: '#FFF1F2',
  amber: '#D97706',
  amberSoft: '#FFFBEB',
  blue: '#2563EB',
  orange: '#EA580C',
  hatch: '#F9FAFB',
  font: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  shadowSm: '0 1px 2px rgba(15, 23, 42, 0.04)',
  shadowMd: '0 4px 16px rgba(15, 23, 42, 0.06)',
  shadowCard: '0 1px 3px rgba(15, 23, 42, 0.05), 0 8px 24px rgba(15, 23, 42, 0.04)',
} as const;

export const WF_LEVEL: Record<ReadinessLevel, string> = {
  Beginner: '#F43F5E',
  Learner: '#F59E0B',
  Familiar: '#3B82F6',
  Skilled: '#22C55E',
};

export const WF_LEVEL_STROKE: Record<ReadinessLevel, string> = {
  Beginner: '#E11D48',
  Learner: '#D97706',
  Familiar: '#2563EB',
  Skilled: '#16A34A',
};

/** CSS variables for scoped shell overrides */
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
  borderRadius: 16,
  boxShadow: WF.shadowCard,
};

export const wfSectionStyle: CSSProperties = {
  background: WF.surfaceMuted,
  borderBottom: `1px solid ${WF.border}`,
};

export const wfTabActiveStyle: CSSProperties = {
  background: WF.surface,
  color: WF.text,
  borderColor: WF.border,
  borderBottomColor: WF.accent,
  boxShadow: WF.shadowSm,
};

export const wfTabInactiveStyle: CSSProperties = {
  background: 'transparent',
  color: WF.muted,
  borderColor: 'transparent',
};
