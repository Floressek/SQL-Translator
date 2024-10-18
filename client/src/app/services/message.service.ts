import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  readonly errorMessage = signal<string>('');
}
