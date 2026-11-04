import { describe, expect, it } from 'vitest';
import { formatCount, pluralTranslate, translate } from './translations';

describe('translate', () => {
  it('returns russian strings by default', () => {
    expect(translate('ru', 'nav.dashboard')).toBe('Обзор');
  });

  it('returns english strings', () => {
    expect(translate('en', 'nav.dashboard')).toBe('Overview');
  });

  it('interpolates parameters', () => {
    expect(translate('ru', 'auth.login.welcome', { username: 'anna' })).toBe(
      'С возвращением, anna!',
    );
    expect(translate('en', 'auth.login.welcome', { username: 'anna' })).toBe(
      'Welcome back, anna!',
    );
  });
});

describe('pluralTranslate', () => {
  it('selects russian plural forms', () => {
    expect(pluralTranslate('ru', 'meetups.found', 1)).toBe('Найдена 1 встреча');
    expect(pluralTranslate('ru', 'meetups.found', 2)).toBe('Найдено 2 встречи');
    expect(pluralTranslate('ru', 'meetups.found', 5)).toBe('Найдено 5 встреч');
    expect(pluralTranslate('ru', 'meetups.found', 21)).toBe('Найдена 21 встреча');
  });

  it('selects english plural forms', () => {
    expect(pluralTranslate('en', 'meetups.found', 1)).toBe('1 meetup found');
    expect(pluralTranslate('en', 'meetups.found', 2)).toBe('2 meetups found');
    expect(pluralTranslate('en', 'meetups.found', 11)).toBe('11 meetups found');
  });
});

describe('formatCount', () => {
  it('formats russian time units', () => {
    expect(formatCount('ru', 1, 'day')).toBe('1 день');
    expect(formatCount('ru', 3, 'day')).toBe('3 дня');
    expect(formatCount('ru', 5, 'day')).toBe('5 дней');
    expect(formatCount('ru', 2, 'minuteAccusative')).toBe('2 минуты');
  });

  it('formats english time units', () => {
    expect(formatCount('en', 1, 'day')).toBe('1 day');
    expect(formatCount('en', 3, 'day')).toBe('3 days');
    expect(formatCount('en', 2, 'hour')).toBe('2 hours');
  });
});
