import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { NgClass } from '@angular/common';
import { ButtonComponent } from '../../components/button/button.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { CardComponent } from '../../components/card/card.component';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { TitlesComponent } from '../../components/titles/titles.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    NgClass,
    CardComponent,
    ButtonComponent,
    SpinnerComponent,
    ReactiveFormsModule,
    TitlesComponent
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  readonly authService = inject(AuthService);
  readonly messageService = inject(MessageService);
  readonly loginForm = new FormGroup({
    password: new FormControl(''),
  });

  submitPassword() {
    const userInput = this.loginForm.value.password || '';
    this.authService.login(userInput);
  }
}
