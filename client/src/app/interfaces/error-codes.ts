export const APIErrorCode = {
  NO_QUERY_ERR: 'NO_QUERY_ERR',
  UNSUPPORTED_QUERY_ERR: 'UNSUPPORTED_QUERY_ERR',
  // INTERNAL_SERVER_ERR: 'INTERNAL_SERVER_ERR',
} as const;
export type APIErrorCode = (typeof APIErrorCode)[keyof typeof APIErrorCode];

export type APIErrorCodeMapping = {
  [key in APIErrorCode]: { message: string; action?: () => void };
};
