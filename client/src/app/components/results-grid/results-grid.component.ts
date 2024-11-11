import { Component, computed, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { DataFetchingService } from '../../services/data-fetching.service';
import { ThemeService } from '../../services/theme.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-results-grid',
  standalone: true,
  imports: [AgGridAngular, NgClass],
  templateUrl: './results-grid.component.html',
  styleUrl: './results-grid.component.scss',
})
export class ResultsGridComponent {
  readonly dataFetchingService = inject(DataFetchingService);
  readonly themeService = inject(ThemeService);

  readonly rowData = this.dataFetchingService.rowData;
  readonly colDefs = computed<ColDef[]>((): ColDef[] => {
    if (this.rowData().length === 0) {
      return [];
    }

    const columnNames = Object.keys(this.rowData()[0]);
    return columnNames.map((name) => ({
      field: name,
    }));
  });
}
