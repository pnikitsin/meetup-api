export type Language = 'ru' | 'en';

export const DEFAULT_LANGUAGE: Language = 'ru';
export const LANGUAGE_STORAGE_KEY = 'meetups.language';

export const SUPPORTED_LANGUAGES: readonly Language[] = ['ru', 'en'];

export function isLanguage(value: unknown): value is Language {
  return value === 'ru' || value === 'en';
}

export function localeFor(language: Language): string {
  return language === 'en' ? 'en-US' : 'ru-RU';
}
