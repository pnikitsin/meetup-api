import { Component, inject } from '@angular/core';
import { I18n } from '../../core/i18n/i18n';
import { Language } from '../../core/i18n/language';
import { TranslationKey } from '../../core/i18n/translations';

interface LanguageOption {
  value: Language;
  short: string;
  label: TranslationKey;
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  template: `
    <div class="language-switch" role="group" [attr.aria-label]="i18n.t('language.label')">
      @for (option of options; track option.value) {
        <button
          type="button"
          class="language-switch__btn"
          [class.is-active]="i18n.language() === option.value"
          [attr.aria-pressed]="i18n.language() === option.value"
          [attr.aria-label]="i18n.t(option.label)"
          [attr.title]="i18n.t(option.label)"
          (click)="select(option.value)"
        >
          {{ option.short }}
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .language-switch {
      display: inline-flex;
      gap: 0.12rem;
      padding: 0.18rem;
      border: 1px solid var(--app-border);
      border-radius: 0.62rem;
      background: #f8f9fd;
    }

    .language-switch__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.95rem;
      height: 1.7rem;
      padding-inline: 0.38rem;
      border: 0;
      border-radius: 0.45rem;
      background: transparent;
      color: var(--app-muted-2);
      font-size: 0.68rem;
      font-weight: 750;
      letter-spacing: 0.04em;
      line-height: 1;
      transition:
        background-color 0.16s ease,
        color 0.16s ease,
        box-shadow 0.16s ease;
    }

    .language-switch__btn:hover {
      color: var(--app-ink);
    }

    .language-switch__btn.is-active {
      background: #fff;
      color: var(--app-primary);
      box-shadow: 0 1px 4px rgba(20, 25, 43, 0.1);
    }
  `,
})
export class LanguageSwitcher {
  readonly i18n = inject(I18n);

  readonly options: readonly LanguageOption[] = [
    { value: 'ru', short: 'RU', label: 'language.ru' },
    { value: 'en', short: 'EN', label: 'language.en' },
  ];

  select(language: Language): void {
    this.i18n.setLanguage(language);
  }
}
