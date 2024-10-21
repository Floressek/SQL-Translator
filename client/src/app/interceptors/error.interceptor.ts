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
    if (error.action) {
      error.action();
    }
  }

readonly APIErrorCodeMapping: APIErrorCodeMapping = {
  'NO_TOKEN_ERR': {
    message: 'Twoja sesja wygasła. Zaloguj się ponownie aby kontynuować.',
    action: () => {
      this.authService.removeAuthenticatedFlag();
      this.authService.isSessionExpired.set(true);
    },
  },
  'INVALID_VERIFICATION_TOKEN_ERR': {
    message: 'Twoja sesja wygasła. Zaloguj się ponownie aby kontynuować.',
    action: () => {
      this.authService.removeAuthenticatedFlag();
      this.authService.isSessionExpired.set(true);
    },
  },
  'INVALID_PASSWORD_ERR': {
    message: 'Podano nieprawidłowe hasło.',
  },
  'NO_QUERY_ERR': {
    message: 'Nie wprowadzono zapytania. Proszę podać zapytanie, aby kontynuować.',
  },
  'NO_PASSWORD_ERR': {
    message: 'Nie wprowadzono hasła. Proszę podać hasło, aby kontynuować.',
  },
  'INTERNAL_SERVER_ERR': {
    message: 'Wystąpił błąd serwera. Spróbuj ponownie później.',
  },
  'UNSUPPORTED_QUERY_ERR': {
    message: 'Wygląda na to, że chcesz wykonać zapytanie inne niż SELECT, co nie jest obsługiwane.',
  },
};
}
