import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card-text-content',
  standalone: true,
  imports: [],
  templateUrl: './card-text-content.component.html',
  styleUrl: './card-text-content.component.scss',
})
export class CardTextContentComponent {
  readonly htmlContent = input<string>('');
}
