import { Component, inject } from '@angular/core';
import { ThemeSwitchComponent } from '../theme-switch/theme-switch.component';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ThemeSwitchComponent, ButtonComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
}
