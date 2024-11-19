import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthPayload } from '../interfaces/reqeust-payloads';
import { apiUrl } from '../utils/apiUrl';
import { Router } from '@angular/router';
import { MessageService } from './message.service';
import { AUTHENTICATED_FLAG } from '../utils/local-storage-flags';
import { finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  readonly messageService = inject(MessageService);
  readonly isLoggedIn = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly isSessionExpired = signal<boolean>(false);
  readonly isWaitingForLogout = signal<boolean>(false);

  login(userPassword: string): void {
    if (!userPassword) {
      this.messageService.errorMessage.set('Please enter the access key.');
      return;
    }

    this.isLoading.set(true);

    const payload: AuthPayload = { password: userPassword };
    this.http
      .post(apiUrl('/auth/login'), payload, {
        withCredentials: true, // Has to be true if the request should be sent with outgoing credentials (cookies).
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.persistLoggedInState();
          this.router.navigate(['/']);
        },
      });
  }

  logout(): void {
    this.isWaitingForLogout.set(true);

    // Empty {} as request body needed in order for this to work 😡
    this.http
      .post(
        apiUrl('/auth/logout'),
        {},
        {
          withCredentials: true, // Has to be true if the request should be sent with outgoing credentials (cookies).
        }
      )
      .pipe(finalize(() => this.isWaitingForLogout.set(false)))
      .subscribe({
        next: () => {
          // Only remove the 'isAuthenticated' flag and redirect to login page after the session was terminated from the backend perspective
          this.persistLoggedOutState();
          this.router.navigate(['/auth/login']);
        },
      });
  }

  persistLoggedInState(): void {
    localStorage.setItem(AUTHENTICATED_FLAG.name, AUTHENTICATED_FLAG.value);
    this.isLoggedIn.set(true);
    this.isSessionExpired.set(false);
  }

  persistLoggedOutState(): void {
    localStorage.removeItem(AUTHENTICATED_FLAG.name);
    this.isLoggedIn.set(false);
  }

  syncAuthenticationState(): void {
    this.isLoggedIn.set(
      localStorage.getItem(AUTHENTICATED_FLAG.name) === AUTHENTICATED_FLAG.value
    );
  }
}
