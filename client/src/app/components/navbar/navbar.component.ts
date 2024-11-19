import { Component, inject } from '@angular/core';
import { ThemeSwitchComponent } from '../theme-switch/theme-switch.component';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../button/button.component';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { ROW_LIMITS } from '../../utils/constants';
import { FormsModule } from '@angular/forms';
import { RowLimitService } from '../../services/row-limit.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ThemeSwitchComponent, ButtonComponent, DropdownModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  readonly rowLimitService = inject(RowLimitService);
  readonly rowLimits = [...ROW_LIMITS];

  updateRowLimit(event: DropdownChangeEvent) {
    this.rowLimitService.persistRowLimit(event.value);
  }
}
