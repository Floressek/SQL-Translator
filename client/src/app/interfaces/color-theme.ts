export const ColorTheme = {
  light: 'light',
  dark: 'dark',
} as const;
export type ColorTheme = (typeof ColorTheme)[keyof typeof ColorTheme];