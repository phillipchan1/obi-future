/** Company Intelligence design system */
export const INTEL = {
  bg: '#1A0A3E',
  tabBar: '#150830',
  surface: '#2D1B69',
  surfaceDark: '#1F0F3D',
  surfaceGreen: '#0F2A1A',
  surfaceChat: '#241560',
  surfaceAlarm: '#1A0608',
  border: '#4A3080',
  accent: '#6B46C1',
  accentBlue: '#2E75B6',
  text: '#FFFFFF',
  textBody: '#C8D0DC',
  muted: '#A89BC8',
  red: '#F85149',
  yellow: '#D29922',
  green: '#3FB950',
} as const;

export type ObiTab = 'intelligence' | 'chat' | 'data';
export type ObiView = 'leader' | 'employee';

export const SEVERITY = {
  risk: { border: INTEL.red, pill: INTEL.red, bg: '#F8514922' },
  watch: { border: INTEL.yellow, pill: INTEL.yellow, bg: '#D2992222' },
  benchmark: { border: INTEL.yellow, pill: INTEL.yellow, bg: '#D2992222' },
  opportunity: { border: INTEL.green, pill: INTEL.green, bg: '#3FB95022' },
  pressure: { border: INTEL.yellow, pill: INTEL.yellow, bg: '#D2992222' },
  personalBenchmark: { border: INTEL.accentBlue, pill: INTEL.accent, bg: '#6B46C122' },
} as const;

export const SOURCE_COLORS: Record<string, string> = {
  WEF: '#3FB950',
  Microsoft: '#7EB8FF',
  'Nielsen Norman': '#D29922',
  McKinsey: '#F85149',
  HBR: '#6B46C1',
};
