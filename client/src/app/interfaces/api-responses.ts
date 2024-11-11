import { APIErrorCode } from './error-codes';

interface APIResponseBase {
  status: 'success' | 'error';
  data?: APIData | APIDataPartial;
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

type APIData = {
  sqlQueryFormatted: string;
  formattedAnswer: string;
  rowData: any[];
};

type APIDataPartial = Pick<APIData, 'sqlQueryFormatted'>;
