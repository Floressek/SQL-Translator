import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../utils/apiUrl';
import { QueryPayload } from '../interfaces/reqeust-payloads';
import {
  EXAMPLE_FORMATTED_ANSWER,
  EXAMPLE_SQL_STATEMENT,
  EXAMPLE_ROW_DATA_ARRAY,
  EXAMPLE_USER_QUERY,
} from '../utils/exampleValues';
import { RowMYSQL } from '../interfaces/row-mysql';
import { AuthService } from './auth.service';
import { finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataFetchingService {
  private readonly http = inject(HttpClient);
  readonly authService = inject(AuthService);
  readonly isLoading = signal<boolean>(false);
  readonly isFirstAppOpen = signal<boolean>(true);
  readonly query = signal<string>(EXAMPLE_USER_QUERY);
  readonly rowData = signal<RowMYSQL[]>(EXAMPLE_ROW_DATA_ARRAY);
  readonly sqlStatement = signal<string>(EXAMPLE_SQL_STATEMENT);
  readonly formattedAnswer = signal<string>(EXAMPLE_FORMATTED_ANSWER);

  fetchAiAnswers(userQuery: string): void {
    this.query.set(userQuery);
    this.isLoading.set(true);

    const payload: QueryPayload = { query: userQuery };
    this.http
      .post<any>(apiUrl('/language-to-sql'), payload, {
        withCredentials: true, // Has to be true if the request should be sent with outgoing credentials (cookies).
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.rowData.set(res.rawData || []);
          this.sqlStatement.set(res.sqlStatement || '');
          this.formattedAnswer.set(res.formattedAnswer || '');
          this.isFirstAppOpen.set(false);
          this.isLoading.set(false);
        },
      });
  }
}
