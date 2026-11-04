import { Component, inject } from '@angular/core';
import { I18n } from '../../core/i18n/i18n';
import { ToastKind, Toasts } from './toast';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-stack" aria-live="polite" aria-atomic="false">
      @for (toast of toasts.items(); track toast.id) {
        <div
          class="toast show app-toast"
          [class]="'app-toast app-toast--' + toast.kind"
          role="alert"
        >
          <div class="toast-header">
            <span class="toast-icon" aria-hidden="true">
              <i class="bi" [class]="iconClass(toast.kind)"></i>
            </span>
            <strong class="me-auto">{{ toast.title }}</strong>
            <button
              type="button"
              class="btn-close"
              [attr.aria-label]="i18n.t('common.closeNotification')"
              (click)="toasts.dismiss(toast.id)"
            ></button>
          </div>
          <div class="toast-body">{{ toast.message }}</div>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-stack {
      position: fixed;
      z-index: 1090;
      top: 1.1rem;
      right: 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
      width: min(24rem, calc(100vw - 2rem));
      pointer-events: none;
    }

    .app-toast {
      overflow: hidden;
      border: 1px solid var(--app-border);
      border-radius: 0.9rem;
      background: #fff;
      box-shadow: 0 20px 48px -18px rgba(20, 25, 43, 0.35);
      pointer-events: auto;
      animation: toast-in 0.26s ease both;
    }

    .toast-header {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.7rem 0.85rem 0.4rem;
      border-bottom: 0;
      background: transparent;
      color: var(--app-ink);
      font-size: 0.86rem;
    }

    .toast-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.55rem;
      height: 1.55rem;
      border-radius: 0.45rem;
      font-size: 0.85rem;
    }

    .toast-body {
      padding: 0 0.85rem 0.85rem 2.95rem;
      color: var(--app-muted);
      font-size: 0.86rem;
      line-height: 1.45;
    }

    .app-toast--success .toast-icon {
      background: #e9f8f1;
      color: #0d7a4e;
    }

    .app-toast--error .toast-icon {
      background: #fff0f1;
      color: #d92d43;
    }

    .app-toast--info .toast-icon {
      background: var(--app-primary-soft);
      color: var(--app-primary);
    }

    .btn-close {
      padding: 0.55rem;
      font-size: 0.65rem;
      opacity: 0.5;
    }

    .btn-close:hover {
      opacity: 0.9;
    }

    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateX(12px);
      }

      to {
        opacity: 1;
        transform: none;
      }
    }

    @media (max-width: 575.98px) {
      .toast-stack {
        top: auto;
        right: 0.75rem;
        bottom: 0.75rem;
        left: 0.75rem;
        width: auto;
      }
    }
  `,
})
export class ToastContainer {
  readonly toasts = inject(Toasts);
  readonly i18n = inject(I18n);

  iconClass(kind: ToastKind): string {
    switch (kind) {
      case 'success':
        return 'bi-check-circle-fill';
      case 'error':
        return 'bi-exclamation-octagon-fill';
      default:
        return 'bi-info-circle-fill';
    }
  }
}
