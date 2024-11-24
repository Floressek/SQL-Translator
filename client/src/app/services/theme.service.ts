import { Injectable, signal } from '@angular/core';
import { ThemeStylesheetLink } from '../interfaces/color-theme';
import { DARK_THEME_FLAG } from '../utils/local-storage-flags';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly isDarkTheme = signal<boolean>(false);

  switchTheme(options = { setFlag: true }) {
    const themeStylesheet: HTMLLinkElement = document.getElementById(
      'app-color-theme'
    ) as HTMLLinkElement;

    if (this.isDarkTheme()) {
      themeStylesheet.href = ThemeStylesheetLink.light;
      this.removeDarkThemeFlag();
    } else {
      themeStylesheet.href = ThemeStylesheetLink.dark;

      if (options.setFlag) {
        this.setDarkThemeFlag();
      }
    }

    this.isDarkTheme.set(!this.isDarkTheme());
  }

  syncAppTheme() {
    if (localStorage.getItem(DARK_THEME_FLAG.name) === DARK_THEME_FLAG.value) {
      this.switchTheme({ setFlag: false });
    }
  }

  setDarkThemeFlag() {
    localStorage.setItem(DARK_THEME_FLAG.name, DARK_THEME_FLAG.value);
  }

  removeDarkThemeFlag() {
    localStorage.removeItem(DARK_THEME_FLAG.name);
  }
}
