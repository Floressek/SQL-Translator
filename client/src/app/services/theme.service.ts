import { Injectable, signal } from '@angular/core';
import { ColorTheme, PrimeNgThemeLink } from '../interfaces/color-theme';
import { DARK_THEME_FLAG } from '../utils/local-storage-flags';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly isDarkTheme = signal<boolean>(false);

  switchTheme(options = { setFlag: true }) {
    const rootElement: HTMLElement = document.documentElement;
    const primeNgThemeLink: HTMLLinkElement = document.getElementById(
      'prime-ng-theme-link'
    ) as HTMLLinkElement;

    if (this.isDarkTheme()) {
      rootElement.id = ColorTheme.light;
      primeNgThemeLink.href = PrimeNgThemeLink.light;
      this.removeDarkThemeFlag();
    } else {
      rootElement.id = ColorTheme.dark;
      primeNgThemeLink.href = PrimeNgThemeLink.dark;

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
