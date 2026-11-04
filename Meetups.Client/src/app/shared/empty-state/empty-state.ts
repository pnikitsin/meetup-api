import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state fade-in">
      <span class="empty-icon" aria-hidden="true">
        <i class="bi" [class]="icon()"></i>
      </span>
      <h3 class="empty-title">{{ title() }}</h3>
      @if (message()) {
        <p class="empty-message">{{ message() }}</p>
      }
      <div class="empty-actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3.2rem 1.5rem;
      text-align: center;
    }

    .empty-title {
      margin: 1.1rem 0 0;
      font-size: 1.1rem;
      font-weight: 750;
      letter-spacing: -0.02em;
    }

    .empty-message {
      max-width: 26rem;
      margin: 0.4rem 0 0;
      color: var(--app-muted);
      font-size: 0.9rem;
      line-height: 1.55;
    }

    .empty-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.6rem;
      margin-top: 1.3rem;
    }

    .empty-actions:empty {
      display: none;
    }
  `,
})
export class EmptyState {
  readonly icon = input('bi-calendar2-x');
  readonly title = input.required<string>();
  readonly message = input('');
}
