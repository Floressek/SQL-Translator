import { APIErrorCode } from './error-codes';

interface APIResponseBase {
  status: 'success' | 'error';
  data?: APIData | APIDataPartial | AboutPageContent;
}

export interface APISuccessResponse extends APIResponseBase {
  status: 'success';
  data: APIData;
}

export interface APIErrorResponse extends APIResponseBase {
  status: 'error';
  errorCode: APIErrorCode;
  errorDetails?: {
    message?: string;
  };
  data?: APIDataPartial;
}

export interface AboutPageContentResponse {
  status: 'success';
  data: AboutPageContent;
}

type APIData = {
  sqlQueryFormatted: string;
  formattedAnswer: string;
  rowData: any[];
};

type APIDataPartial = Pick<APIData, 'sqlQueryFormatted'>;

export type AboutPageContent = {
  promptCode: string;
  dbSchema: object | string;
  promptExamples: any[] | string;
}
