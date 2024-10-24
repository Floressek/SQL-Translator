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

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Reset error message before each HTTP request
    this.messageService.errorMessage.set('');

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const { status, errorCode } = error.error;

        if (
          status === 'error' &&
          Object.values(APIErrorCode).includes(errorCode)
        ) {
          // Handle known errors
          this.handleAPIError(errorCode);
        } else {
          // Default generic error message if no mapping found
          this.messageService.errorMessage.set(
            'Failed to connect to the server.'
          );
        }

        return throwError(() => error);
      })
    );
  }

  handleAPIError(errorCode: APIErrorCode): void {
    const error = this.APIErrorCodeMapping[errorCode];

    this.messageService.errorMessage.set(error.message);
    if (error.action) {
      error.action();
    }
  }

  readonly APIErrorCodeMapping: APIErrorCodeMapping = {
    NO_TOKEN_ERR: {
      message: 'Your session has expired. Please log in again to continue.',
      action: () => {
        this.authService.removeAuthenticatedFlag();
        this.authService.isSessionExpired.set(true);
      },
    },
    INVALID_VERIFICATION_TOKEN_ERR: {
      message: 'Your session has expired. Please log in again to continue.',
      action: () => {
        this.authService.removeAuthenticatedFlag();
        this.authService.isSessionExpired.set(true);
      },
    },
    INVALID_PASSWORD_ERR: {
      message: 'Invalid password provided.',
    },
    NO_QUERY_ERR: {
      message: 'No query was entered. Please provide a query to continue.',
    },
    NO_PASSWORD_ERR: {
      message:
        'No password was entered. Please provide a password to continue.',
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
