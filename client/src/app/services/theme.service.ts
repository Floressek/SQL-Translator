import { Injectable, signal } from '@angular/core';
import { ColorTheme } from '../interfaces/color-theme';

export const storageKey = 'theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly isDarkTheme = signal<boolean>(false);
  readonly themeFlagName = 'theme';

  switchTheme() {
    const rootElement: HTMLElement = document.documentElement;
    if (this.isDarkTheme()) {
      rootElement.id = ColorTheme.light;
      this.removeDarkThemeFlag();
    } else {
      rootElement.id = ColorTheme.dark;
      this.persistDarkTheme();
    }

    this.isDarkTheme.set(!this.isDarkTheme());
  }

  initializeAppTheme() {
    const darkThemeFlag = localStorage.getItem(this.themeFlagName);
    if (darkThemeFlag && darkThemeFlag === ColorTheme.dark) {
      this.isDarkTheme.set(true);
      const rootElement: HTMLElement = document.documentElement;
      rootElement.id = ColorTheme.dark;
    }
  }

  persistDarkTheme() {
    localStorage.setItem(this.themeFlagName, ColorTheme.dark);
  }

  removeDarkThemeFlag() {
    localStorage.removeItem(this.themeFlagName);
  }
}
