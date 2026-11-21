import { computed, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark';

export const DEFAULT_THEME: Theme = 'light';
export const THEME_STORAGE_KEY = 'meetups.theme';

const THEME_COLORS: Record<Theme, string> = {
  light: '#5b4bdb',
  dark: '#0d1119',
};

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

function prefersDarkScheme(): boolean {
  try {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  } catch {
    return false;
  }
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : prefersDarkScheme() ? 'dark' : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly themeState = signal<Theme>(readStoredTheme());

  readonly theme = this.themeState.asReadonly();
  readonly isDark = computed(() => this.themeState() === 'dark');

  constructor() {
    this.apply(this.themeState());
  }

  setTheme(theme: Theme): void {
    if (theme === this.themeState()) {
      return;
    }

    this.themeState.set(theme);
    this.apply(theme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Приватный режим может запрещать запись — тема останется в памяти.
    }
  }

  toggle(): void {
    this.setTheme(this.isDark() ? 'light' : 'dark');
  }

  private apply(theme: Theme): void {
    const root = this.document.documentElement;
    root.setAttribute('data-bs-theme', theme);
    root.style.colorScheme = theme;

    this.document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLORS[theme]);
  }
}
