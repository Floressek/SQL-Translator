export const ColorTheme = {
  light: 'light',
  dark: 'dark',
} as const;
export type ColorTheme = (typeof ColorTheme)[keyof typeof ColorTheme];

export const PrimeNgThemeLink = {
  light: './md-light-deeppurple.css',
  dark: './md-dark-deeppurple.css',
} as const;
export type PrimeNgThemeLink =
  (typeof PrimeNgThemeLink)[keyof typeof PrimeNgThemeLink];
