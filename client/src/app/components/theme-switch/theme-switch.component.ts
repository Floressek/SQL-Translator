import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-theme-switch',
  standalone: true,
  imports: [NgClass],
  templateUrl: './theme-switch.component.html',
  styleUrl: './theme-switch.component.scss',
})
export class ThemeSwitchComponent {
  readonly themeService = inject(ThemeService);
}
