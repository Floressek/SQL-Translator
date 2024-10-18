import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthPayload } from '../interfaces/reqeust-payloads';
import { apiUrl } from '../utils/apiUrl';
import { Router } from '@angular/router';
import { MessageService } from './message.service';
import { finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  readonly messageService = inject(MessageService);
  readonly isLoading = signal<boolean>(false);
  readonly isSessionExpired = signal<boolean>(false);
  readonly isWaitingForLogout = signal<boolean>(false);

  login(userPassword: string): void {
    if (!userPassword) {
      this.messageService.errorMessage.set('Proszę podać klucz dostępu.');
      return;
    }

    this.isLoading.set(true);

    const payload: AuthPayload = { password: userPassword };
    this.http
      .post<any>(apiUrl('/auth/login'), payload, {
        withCredentials: true, // Has to be true if the request should be sent with outgoing credentials (cookies).
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.persistLoggedInState();
          this.isSessionExpired.set(false);
          this.router.navigate(['/']);
          this.isLoading.set(false);
        },
      });
  }

  logout(): void {
    this.isWaitingForLogout.set(true);

    // Empty {} as request body needed in order for this to work 😡
    this.http
      .post<any>(
        apiUrl('/auth/logout'),
        {},
        {
          withCredentials: true, // Has to be true if the request should be sent with outgoing credentials (cookies).
        }
      )
      .pipe(finalize(() => this.isWaitingForLogout.set(false)))
      .subscribe({
        next: (res) => {
          // Only remove the 'isAuthenticated' flag and redirect to login page after the session was terminated from the backend perspective
          this.removeAuthenticatedFlag();
          this.router.navigate(['/auth/login']);
          this.isWaitingForLogout.set(false);
        },
      });
  }

  persistLoggedInState(): void {
    localStorage.setItem('isAuthenticated', 'true');
  }

  removeAuthenticatedFlag(): void {
    localStorage.removeItem('isAuthenticated');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true';
  }
}
