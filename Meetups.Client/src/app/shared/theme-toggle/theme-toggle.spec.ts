import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { THEME_STORAGE_KEY } from '../../core/theme/theme';
import { ThemeToggle } from './theme-toggle';

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

describe('ThemeToggle', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    document.documentElement.removeAttribute('data-bs-theme');
    vi.stubGlobal('matchMedia', () => mediaQuery(false));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('switches between light and dark theme', () => {
    const fixture = TestBed.createComponent(ThemeToggle);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const icon = (): string => button.querySelector('i')?.className ?? '';

    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Включить тёмную тему');
    expect(icon()).toContain('bi-moon-stars');

    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Включить светлую тему');
    expect(icon()).toContain('bi-sun');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });
});
