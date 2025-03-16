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

import { APIErrorCode, APIErrorCodeMapping } from '../interfaces/error-codes';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private messageService: MessageService,
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
            'Nie udało się połączyć z serwerem.'
          );
        }

        return throwError(() => error);
      })
    );
  }

  handleAPIError(errorCode: APIErrorCode): void {
    const error = this.APIErrorCodeMapping[errorCode];

    this.messageService.errorMessage.set(error.message);
  }

readonly APIErrorCodeMapping: {
  NO_QUERY_ERR: { message: string };
  UNSUPPORTED_QUERY_ERR: { message: string }
} = {

  'NO_QUERY_ERR': {
    message: 'Nie wprowadzono zapytania. Proszę podać zapytanie, aby kontynuować.',
  },
  'UNSUPPORTED_QUERY_ERR': {
    message: 'Wygląda na to, że chcesz wykonać zapytanie inne niż SELECT, co nie jest obsługiwane.',
  },
};
}
