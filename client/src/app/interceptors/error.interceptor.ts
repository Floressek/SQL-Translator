import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from '../services/message.service';
import { AuthService } from '../services/auth.service';
import { APIErrorCode, APIErrorCodeMapping } from '../interfaces/error-codes';
import { APIErrorResponse } from '../interfaces/api-responses';
import { DataFetchingService } from '../services/data-fetching.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private dataFetchingService: DataFetchingService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Reset error message before each HTTP request
    this.messageService.errorMessage.set('');

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle known errors
        if (this.isKnownAPIErrorResponse(error.error)) {
          this.handleAPIError(error.error);
        } else {
          // Default generic error message
          this.messageService.errorMessage.set(
            'Failed to connect to the server.'
          );
        }

        return throwError(() => error);
      })
    );
  }

  // Type guard to ensure that the error is of correct type and has a known errorCode
  private isKnownAPIErrorResponse(error: any): error is APIErrorResponse {
    return (
      typeof error === 'object' &&
      error !== null &&
      error.status === 'error' &&
      typeof error.errorCode === 'string' &&
      Object.values(APIErrorCode).includes(error.errorCode)
    );
  }

  private handleAPIError(APIError: APIErrorResponse): void {
    // Set error message
    const errorMapping = this.APIErrorCodeMapping[APIError.errorCode];
    if (
      APIError.errorDetails?.message &&
      (APIError.errorCode === APIErrorCode.MISSING_PARAM_ERR ||
        APIError.errorCode === APIErrorCode.INVALID_PARAM_ERR)
    ) {
      this.messageService.errorMessage.set(APIError.errorDetails.message);
    } else {
      this.messageService.errorMessage.set(errorMapping.message);
    }

    // Update sqlQueryFormatted if present on error response
    if (APIError.data?.sqlQueryFormatted) {
      this.dataFetchingService.sqlQueryFormatted.set(
        APIError.data?.sqlQueryFormatted
      );
      this.dataFetchingService.formattedAnswer.set('');
      this.dataFetchingService.rowData.set([]);
    }

    // Execute any additional action if defined
    errorMapping.action?.();
  }

  readonly APIErrorCodeMapping: APIErrorCodeMapping = {
    MISSING_PARAM_ERR: {
      message: 'Required paramater missing.',
    },
    INVALID_PARAM_ERR: {
      message: 'Invalid parameter value.',
    },
    NO_TOKEN_ERR: {
      message: 'Your session has expired. Please log in again to continue.',
      action: () => {
        this.authService.persistLoggedOutState();
        this.authService.isSessionExpired.set(true);
      },
    },
    INVALID_VERIFICATION_TOKEN_ERR: {
      message: 'Your session has expired. Please log in again to continue.',
      action: () => {
        this.authService.persistLoggedOutState();
        this.authService.isSessionExpired.set(true);
      },
    },
    INVALID_PASSWORD_ERR: {
      message: 'Invalid password provided.',
    },
    INTERNAL_SERVER_ERR: {
      message: 'A server error occurred. Please try again later.',
    },
    UNSUPPORTED_QUERY_ERR: {
      message:
        'It seems that you are trying to perform a non-SELECT query, which is not supported.',
    },
  };
}
