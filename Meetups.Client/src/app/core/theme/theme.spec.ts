import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { THEME_STORAGE_KEY, ThemeService } from './theme';

function mediaQuery(matches: boolean): MediaQueryList {
  return {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  } as unknown as MediaQueryList;
}

describe('ThemeService', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    document.documentElement.removeAttribute('data-bs-theme');
    vi.stubGlobal('matchMedia', () => mediaQuery(false));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to the light theme', () => {
    const theme = TestBed.inject(ThemeService);

    expect(theme.theme()).toBe('light');
    expect(theme.isDark()).toBe(false);
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
  });

  it('follows the system preference when nothing is stored', () => {
    vi.stubGlobal('matchMedia', () => mediaQuery(true));

    const theme = TestBed.inject(ThemeService);

    expect(theme.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
  });

  it('toggles the theme and persists the choice', () => {
    const theme = TestBed.inject(ThemeService);

    theme.toggle();

    expect(theme.isDark()).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');

    theme.toggle();

    expect(theme.theme()).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
  });

  it('restores the stored theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    const theme = TestBed.inject(ThemeService);

    expect(theme.theme()).toBe('dark');
    expect(theme.isDark()).toBe(true);
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
  });

  it('ignores unsupported stored values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');

    const theme = TestBed.inject(ThemeService);

    expect(theme.theme()).toBe('light');
  });
});
