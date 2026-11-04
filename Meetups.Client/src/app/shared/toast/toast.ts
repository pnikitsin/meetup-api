import { inject, Injectable, signal } from '@angular/core';
import { I18n } from '../../core/i18n/i18n';
import { TranslationKey } from '../../core/i18n/translations';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message: string;
}

interface ToastOptions {
  title?: string;
  duration?: number;
}

const DEFAULT_TITLES: Record<ToastKind, TranslationKey> = {
  success: 'common.toastSuccessTitle',
  error: 'common.toastErrorTitle',
  info: 'common.toastInfoTitle',
};

@Injectable({ providedIn: 'root' })
export class Toasts {
  private readonly i18n = inject(I18n);
  private nextId = 1;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly itemsState = signal<Toast[]>([]);

  readonly items = this.itemsState.asReadonly();

  success(message: string, options: ToastOptions = {}): void {
    this.show('success', message, options);
  }

  error(message: string, options: ToastOptions = {}): void {
    this.show('error', message, options);
  }

  info(message: string, options: ToastOptions = {}): void {
    this.show('info', message, options);
  }

  show(kind: ToastKind, message: string, options: ToastOptions = {}): void {
    const id = this.nextId++;
    const toast: Toast = {
      id,
      kind,
      title: options.title ?? this.i18n.t(DEFAULT_TITLES[kind]),
      message,
    };

    this.itemsState.update((items) => [...items, toast]);

    const duration = options.duration ?? (kind === 'error' ? 6500 : 4500);
    const timer = setTimeout(() => this.dismiss(id), duration);
    this.timers.set(id, timer);
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);

    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.itemsState.update((items) => items.filter((toast) => toast.id !== id));
  }
}
