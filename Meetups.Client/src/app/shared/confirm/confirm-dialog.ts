import { Component, effect, inject } from '@angular/core';
import { ConfirmDialog } from './confirm';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (dialog.request(); as request) {
      <div class="modal-backdrop-custom" (click)="dialog.cancel()"></div>
      <div
        class="modal d-block app-confirm"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="request.title"
        (click)="dialog.cancel()"
      >
        <div class="modal-dialog modal-dialog-centered" (click)="$event.stopPropagation()">
          <div class="modal-content">
            <div class="modal-body">
              <span class="confirm-icon" [class.is-danger]="request.tone === 'danger'">
                <i class="bi" [class]="request.tone === 'danger' ? 'bi-trash3' : 'bi-question-lg'"></i>
              </span>
              <h2 class="confirm-title">{{ request.title }}</h2>
              <p class="confirm-message">{{ request.message }}</p>
              <div class="confirm-actions">
                <button type="button" class="btn btn-outline-secondary" (click)="dialog.cancel()">
                  {{ request.cancelLabel }}
                </button>
                <button
                  type="button"
                  class="btn"
                  [class.btn-danger]="request.tone === 'danger'"
                  [class.btn-primary]="request.tone !== 'danger'"
                  autofocus
                  (click)="dialog.accept()"
                >
                  {{ request.confirmLabel }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .modal-backdrop-custom {
      position: fixed;
      z-index: 1050;
      inset: 0;
      background: rgba(20, 25, 43, 0.48);
      backdrop-filter: blur(2px);
      animation: backdrop-in 0.18s ease both;
    }

    .app-confirm {
      z-index: 1055;
      background: transparent;
    }

    .modal-content {
      overflow: hidden;
      border: 0;
      border-radius: 1.25rem;
      box-shadow: 0 30px 80px -24px rgba(20, 25, 43, 0.5);
      animation: dialog-in 0.22s ease both;
    }

    .modal-body {
      padding: 1.6rem;
    }

    .confirm-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.8rem;
      height: 2.8rem;
      margin-bottom: 1rem;
      border-radius: 0.9rem;
      background: var(--app-primary-soft);
      color: var(--app-primary);
      font-size: 1.25rem;
    }

    .confirm-icon.is-danger {
      background: #fff0f1;
      color: #d92d43;
    }

    .confirm-title {
      margin: 0 0 0.45rem;
      font-size: 1.18rem;
      font-weight: 750;
      letter-spacing: -0.02em;
    }

    .confirm-message {
      margin: 0;
      color: var(--app-muted);
      font-size: 0.92rem;
      line-height: 1.55;
    }

    .confirm-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.6rem;
      margin-top: 1.4rem;
    }

    @keyframes backdrop-in {
      from {
        opacity: 0;
      }

      to {
        opacity: 1;
      }
    }

    @keyframes dialog-in {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.98);
      }

      to {
        opacity: 1;
        transform: none;
      }
    }

    @media (max-width: 575.98px) {
      .confirm-actions {
        flex-direction: column-reverse;
      }

      .confirm-actions .btn {
        width: 100%;
      }
    }
  `,
})
export class ConfirmDialogComponent {
  readonly dialog = inject(ConfirmDialog);

  constructor() {
    effect((onCleanup) => {
      const isOpen = this.dialog.request() !== null;
      document.body.classList.toggle('modal-open', isOpen);

      onCleanup(() => document.body.classList.remove('modal-open'));
    });
  }
}
