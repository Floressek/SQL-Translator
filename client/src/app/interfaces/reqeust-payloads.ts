import { RowLimit } from "../utils/constants";

export interface QueryPayload {
  query: string;
  rowLimit: RowLimit;
}

export interface AuthPayload {
  password: string;
}
