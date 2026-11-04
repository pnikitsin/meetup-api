import { inject, Injectable, signal } from '@angular/core';
import { I18n } from '../../core/i18n/i18n';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialog {
  private readonly i18n = inject(I18n);
  private resolver: ((result: boolean) => void) | null = null;
  private readonly requestState = signal<Required<ConfirmOptions> | null>(null);

  readonly request = this.requestState.asReadonly();

  ask(options: ConfirmOptions): Promise<boolean> {
    if (this.resolver) {
      this.resolver(false);
      this.resolver = null;
    }

    this.requestState.set({
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel ?? this.i18n.t('common.confirm'),
      cancelLabel: options.cancelLabel ?? this.i18n.t('common.cancel'),
      tone: options.tone ?? 'primary',
    });

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  accept(): void {
    this.finish(true);
  }

  cancel(): void {
    this.finish(false);
  }

  private finish(result: boolean): void {
    const resolver = this.resolver;
    this.resolver = null;
    this.requestState.set(null);
    resolver?.(result);
  }
}
