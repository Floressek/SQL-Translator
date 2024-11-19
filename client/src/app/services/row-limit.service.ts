import { Injectable, signal } from '@angular/core';
import { RowLimit, DEFAULT_ROW_LIMIT, ROW_LIMITS } from '../utils/constants';
import { ROW_LIMIT_FLAG } from '../utils/local-storage-flags';

@Injectable({
  providedIn: 'root',
})
export class RowLimitService {
  readonly rowLimit = signal<RowLimit>(DEFAULT_ROW_LIMIT);

  persistRowLimit(rowLimit: RowLimit) {
    this.rowLimit.set(rowLimit);

    if (this.rowLimit() === DEFAULT_ROW_LIMIT) {
      localStorage.removeItem(ROW_LIMIT_FLAG.name);
    } else {
      localStorage.setItem(ROW_LIMIT_FLAG.name, String(this.rowLimit()));
    }
  }

  syncRowLimit() {
    const storedLimit = Number(localStorage.getItem(ROW_LIMIT_FLAG.name));
    if (storedLimit && ROW_LIMITS.includes(storedLimit as RowLimit)) {
      this.rowLimit.set(storedLimit as RowLimit);
    }
  }
}
