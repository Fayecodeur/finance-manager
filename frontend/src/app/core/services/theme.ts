import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private storageKey = 'theme';
  isDark = signal<boolean>(localStorage.getItem(this.storageKey) === 'dark');

  constructor() {
    this.apply(this.isDark());
  }

  toggleTheme(): void {
    this.isDark.update((v) => !v);
    this.apply(this.isDark());
    localStorage.setItem(this.storageKey, this.isDark() ? 'dark' : 'light');
  }

  private apply(dark: boolean): void {
    document.documentElement.classList.toggle('dark-theme', dark);
  }
}
