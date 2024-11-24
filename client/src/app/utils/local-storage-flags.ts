export const BOOLEAN_FLAG = 'true';

export const AUTHENTICATED_FLAG = {
  name: 'isAuthenticated',
  value: BOOLEAN_FLAG,
} as const;

export const DARK_THEME_FLAG = {
  name: 'dark-theme',
  value: BOOLEAN_FLAG,
} as const;

export const ROW_LIMIT_FLAG = {
  name: 'rowLimit',
} as const;
