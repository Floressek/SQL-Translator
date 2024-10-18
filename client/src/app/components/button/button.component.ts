import { Component, input } from '@angular/core';
import { ButtonType, ButtonAppearance } from './button.types';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  readonly disabled = input<boolean>(false);
  readonly type = input<ButtonType>('button');
  readonly appearance = input<ButtonAppearance>('FAB');
}
