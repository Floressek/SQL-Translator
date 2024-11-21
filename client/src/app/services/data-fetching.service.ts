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
import {
  ABOUT_PAGE_CONTENT_EMPTY,
  FAILED_TO_LOAD_RESOURCE,
} from '../utils/defaultPageContents';
import { RowMYSQL } from '../interfaces/row-mysql';
import { AuthService } from './auth.service';
import { finalize } from 'rxjs';
import {
  APISuccessResponse,
  AboutPageContentResponse,
  AboutPageContent,
} from '../interfaces/api-responses';
import { RowLimitService } from './row-limit.service';

@Injectable({
  providedIn: 'root',
})
export class DataFetchingService {
  private readonly http = inject(HttpClient);
  readonly authService = inject(AuthService);
  readonly rowLimitService = inject(RowLimitService);

  readonly isLoading = signal<boolean>(false);
  readonly isFirstAppOpen = signal<boolean>(false);

  readonly query = signal<string>(EXAMPLE_USER_QUERY);
  readonly rowData = signal<RowMYSQL[]>(EXAMPLE_ROW_DATA_ARRAY);
  readonly sqlQueryFormatted = signal<string>(EXAMPLE_SQL_STATEMENT);
  readonly formattedAnswer = signal<string>(EXAMPLE_FORMATTED_ANSWER);

  readonly aboutPageContent = signal<AboutPageContent>(
    ABOUT_PAGE_CONTENT_EMPTY
  );

  fetchAiAnswers(userQuery: string): void {
    this.query.set(userQuery);
    this.isLoading.set(true);

    const payload: QueryPayload = {
      query: userQuery,
      rowLimit: this.rowLimitService.rowLimit(),
    };
    this.http
      .post<APISuccessResponse>(apiUrl('/language-to-sql'), payload, {
        withCredentials: true, // Has to be true if the request should be sent with outgoing credentials (cookies).
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.rowData.set(res.data?.rowData || []);
          this.sqlQueryFormatted.set(res.data?.sqlQueryFormatted || '');
          this.formattedAnswer.set(res.data?.formattedAnswer || '');
          this.isFirstAppOpen.set(false);
        },
      });
  }

  fetchAboutPageContent(): void {
    this.http
      .get<AboutPageContentResponse>(apiUrl('/about'), {
        withCredentials: true,
      })
      .subscribe({
        next: (res) => {
          const dbSchema =
            res?.data?.dbSchema && JSON.stringify(res?.data?.dbSchema) !== '{}'
              ? JSON.stringify(res?.data?.dbSchema, null, 4)
              : FAILED_TO_LOAD_RESOURCE;

          const promptExamples =
            res?.data?.promptExamples &&
            JSON.stringify(res?.data?.promptExamples) !== '[]'
              ? JSON.stringify(res?.data?.promptExamples, null, 4)
              : FAILED_TO_LOAD_RESOURCE;

          this.aboutPageContent.set({
            promptCode: res?.data?.promptCode || FAILED_TO_LOAD_RESOURCE,
            dbSchema,
            promptExamples,
          });
        },
        error: (err) => {
          this.aboutPageContent.set(ABOUT_PAGE_CONTENT_EMPTY);
        },
      });
  }
}
