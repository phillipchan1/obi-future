/** Design tokens derived from Leader Dashboard reference */

export const RW = {
  pageBg: '#F9F9F7',
  sidebar: '#12161D',
  brandGold: '#EAB308',
  text: '#1D1D1F',
  textSecondary: '#48484A',
  muted: '#86868B',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  card: '#FFFFFF',
  cardShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',

  purpleBg: '#F5F3FF',
  purpleText: '#7C3AED',
  purpleBorder: '#DDD6FE',

  redBg: '#FEF2F2',
  redText: '#DC2626',
  redBorder: '#FECACA',

  orangeBg: '#FFF7ED',
  orangeText: '#EA580C',
  orangeBorder: '#FED7AA',

  greenBg: '#F0FDF4',
  greenText: '#16A34A',
  greenBorder: '#BBF7D0',

  blueBg: '#EFF6FF',
  blueText: '#2563EB',
  blueBorder: '#BFDBFE',

  font: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
} as const;

export type SceneAccent = 'neutral' | 'cool' | 'warm' | 'amber' | 'success';

export const SCENE_ACCENT_STYLES: Record<
  SceneAccent,
  { bg: string; text: string; border: string; glow: string }
> = {
  neutral: {
    bg: RW.purpleBg,
    text: RW.purpleText,
    border: RW.purpleBorder,
    glow: 'rgba(124, 58, 237, 0.08)',
  },
  cool: {
    bg: RW.blueBg,
    text: RW.blueText,
    border: RW.blueBorder,
    glow: 'rgba(37, 99, 235, 0.08)',
  },
  warm: {
    bg: RW.orangeBg,
    text: RW.orangeText,
    border: RW.orangeBorder,
    glow: 'rgba(234, 88, 12, 0.08)',
  },
  amber: {
    bg: '#FFFBEB',
    text: '#D97706',
    border: '#FDE68A',
    glow: 'rgba(217, 119, 6, 0.08)',
  },
  success: {
    bg: RW.greenBg,
    text: RW.greenText,
    border: RW.greenBorder,
    glow: 'rgba(22, 163, 74, 0.08)',
  },
};

export const CONFIDENCE_STYLES: Record<
  'Measured' | 'Estimated' | 'Directional',
  { bg: string; text: string }
> = {
  Measured: { bg: RW.greenBg, text: RW.greenText },
  Estimated: { bg: RW.orangeBg, text: RW.orangeText },
  Directional: { bg: RW.purpleBg, text: RW.purpleText },
};
