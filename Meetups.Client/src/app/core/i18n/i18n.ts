import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  DEFAULT_LANGUAGE,
  isLanguage,
  LANGUAGE_STORAGE_KEY,
  Language,
  localeFor,
} from './language';
import {
  formatCount,
  pluralTranslate,
  translate,
  TranslationKey,
} from './translations';

function readStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly document = inject(DOCUMENT);
  private readonly languageState = signal<Language>(readStoredLanguage());

  readonly language = this.languageState.asReadonly();
  readonly locale = computed(() => localeFor(this.language()));
  readonly isEnglish = computed(() => this.language() === 'en');

  constructor() {
    effect(() => {
      const language = this.language();
      this.document.documentElement.lang = language;

      const description = this.document.querySelector('meta[name="description"]');
      description?.setAttribute('content', this.t('meta.description'));
    });
  }

  setLanguage(language: Language): void {
    if (language === this.language()) {
      return;
    }

    this.languageState.set(language);

    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Приватный режим может запрещать запись — язык останется в памяти.
    }
  }

  toggle(): void {
    this.setLanguage(this.language() === 'ru' ? 'en' : 'ru');
  }

  t(key: TranslationKey, params?: Record<string, string | number>): string {
    return translate(this.language(), key, params);
  }

  plural(key: string, count: number, params?: Record<string, string | number>): string {
    return pluralTranslate(this.language(), key, count, params);
  }

  count(
    count: number,
    unit: 'day' | 'hour' | 'minute' | 'minuteAccusative',
  ): string {
    return formatCount(this.language(), count, unit);
  }
}
