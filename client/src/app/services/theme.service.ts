import { Injectable, signal } from '@angular/core';
import { ColorTheme } from '../interfaces/color-theme';
import { DARK_THEME_FLAG } from '../utils/constants';

export const storageKey = 'theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly isDarkTheme = signal<boolean>(false);

  switchTheme() {
    const rootElement: HTMLElement = document.documentElement;
    if (this.isDarkTheme()) {
      rootElement.id = ColorTheme.light;
      this.removeDarkThemeFlag();
    } else {
      rootElement.id = ColorTheme.dark;
      this.setDarkThemeFlag();
    }

    this.isDarkTheme.set(!this.isDarkTheme());
  }

  initializeAppTheme() {
    if (localStorage.getItem(DARK_THEME_FLAG.name) === DARK_THEME_FLAG.value) {
      this.isDarkTheme.set(true);
      const rootElement: HTMLElement = document.documentElement;
      rootElement.id = ColorTheme.dark;
    }
  }

  setDarkThemeFlag() {
    localStorage.setItem(DARK_THEME_FLAG.name, DARK_THEME_FLAG.value);
  }

  removeDarkThemeFlag() {
    localStorage.removeItem(DARK_THEME_FLAG.name);
  }
}
