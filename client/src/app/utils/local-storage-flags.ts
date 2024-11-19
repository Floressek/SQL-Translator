import { ColorTheme } from '../interfaces/color-theme';

export const AUTHENTICATED_FLAG = {
  name: 'isAuthenticated',
  value: 'true',
} as const;

export const DARK_THEME_FLAG = {
  name: 'theme',
  value: ColorTheme.dark,
} as const;

export const ROW_LIMIT_FLAG = {
  name: 'rowLimit',
} as const;
