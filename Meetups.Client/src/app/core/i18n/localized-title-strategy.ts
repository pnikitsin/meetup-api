import { effect, inject, Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { I18n } from './i18n';
import { TranslationKey } from './translations';

/**
 * Маршруты хранят ключи переводов в title, а стратегия обновляет
 * заголовок документа при навигации и смене языка.
 */
@Injectable({ providedIn: 'root' })
export class LocalizedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(I18n);
  private readonly titleKey = signal<TranslationKey | null>(null);

  constructor() {
    super();

    effect(() => {
      const key = this.titleKey();

      if (key) {
        this.title.setTitle(this.i18n.t(key));
      }
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    this.titleKey.set(title ? (title as TranslationKey) : null);
  }
}
