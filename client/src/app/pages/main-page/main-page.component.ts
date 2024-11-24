import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ButtonComponent } from '../../components/button/button.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { CardComponent } from '../../components/card/card.component';
import { ResultsGridComponent } from '../../components/results-grid/results-grid.component';
import { DataFetchingService } from '../../services/data-fetching.service';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { TitlesComponent } from '../../components/titles/titles.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    NgClass,
    CardComponent,
    ButtonComponent,
    SpinnerComponent,
    ResultsGridComponent,
    ReactiveFormsModule,
    TitlesComponent,
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
})
export class MainPageComponent {
  readonly dataFetchingService = inject(DataFetchingService);
  readonly authService = inject(AuthService);
  readonly messageService = inject(MessageService);
  readonly dbQuestionForm = new FormGroup({
    query: new FormControl(this.dataFetchingService.query()),
  });

  submitOnEnter(event: KeyboardEvent): void {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !this.dataFetchingService.isLoading() &&
      !this.authService.isWaitingForLogout() &&
      !this.authService.isSessionExpired()
    ) {
      event.preventDefault(); // Prevent newline
      this.submitQuery();
    }
  }

  submitQuery() {
    const userInput = this.dbQuestionForm.value.query || '';
    this.dataFetchingService.fetchAiAnswers(userInput);
  }
}
