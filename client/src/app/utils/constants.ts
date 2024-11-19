export const DEFAULT_ROW_LIMIT = 3 as const;

export const ROW_LIMITS = [1, DEFAULT_ROW_LIMIT, 5, 10, 25, 50] as const;

export type RowLimit = (typeof ROW_LIMITS)[number];