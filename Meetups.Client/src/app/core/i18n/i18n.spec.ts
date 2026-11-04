import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { I18n } from './i18n';
import { LANGUAGE_STORAGE_KEY } from './language';

describe('I18n', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  it('defaults to russian', () => {
    const i18n = TestBed.inject(I18n);

    expect(i18n.language()).toBe('ru');
    expect(i18n.locale()).toBe('ru-RU');
    expect(i18n.t('nav.dashboard')).toBe('Обзор');
  });

  it('switches language and persists the choice', () => {
    const i18n = TestBed.inject(I18n);

    i18n.setLanguage('en');

    expect(i18n.language()).toBe('en');
    expect(i18n.locale()).toBe('en-US');
    expect(i18n.t('nav.dashboard')).toBe('Overview');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });

  it('restores the stored language', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');

    const i18n = TestBed.inject(I18n);

    expect(i18n.language()).toBe('en');
  });

  it('ignores unsupported stored values', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'de');

    const i18n = TestBed.inject(I18n);

    expect(i18n.language()).toBe('ru');
  });
});
