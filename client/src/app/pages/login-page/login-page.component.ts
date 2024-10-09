import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { NgClass } from '@angular/common';
import { ButtonComponent } from '../../components/button/button.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { CardComponent } from '../../components/card/card.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    NgClass,
    CardComponent,
    ButtonComponent,
    SpinnerComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  readonly authService = inject(AuthService);
  readonly loginForm = new FormGroup({
    passwordInput: new FormControl(''),
  });

  submitPassword() {
    const userInput = this.loginForm.value.passwordInput || '';
    this.authService.login(userInput);
  }
}
