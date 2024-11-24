export const ThemeStylesheetLink = {
  light: './app-theme-light.css',
  dark: './app-theme-dark.css',
} as const;
export type PrimeNgThemeLink =
  (typeof ThemeStylesheetLink)[keyof typeof ThemeStylesheetLink];
