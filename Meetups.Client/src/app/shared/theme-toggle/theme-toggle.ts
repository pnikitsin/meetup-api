import { Component, computed, inject } from '@angular/core';
import { I18n } from '../../core/i18n/i18n';
import { ThemeService } from '../../core/theme/theme';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button
      type="button"
      class="theme-toggle"
      [attr.aria-pressed]="theme.isDark()"
      [attr.aria-label]="label()"
      [attr.title]="label()"
      (click)="theme.toggle()"
    >
      <i class="bi" [class]="theme.isDark() ? 'bi-sun' : 'bi-moon-stars'" aria-hidden="true"></i>
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .theme-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.08rem;
      height: 2.08rem;
      padding: 0;
      border: 1px solid var(--app-border);
      border-radius: 0.62rem;
      background: var(--app-subtle);
      color: var(--app-muted);
      font-size: 0.95rem;
      line-height: 1;
      transition:
        background-color 0.16s ease,
        border-color 0.16s ease,
        color 0.16s ease,
        transform 0.16s ease;
    }

    .theme-toggle:hover {
      border-color: var(--app-tint-border);
      background: var(--app-elevated);
      color: var(--app-primary);
    }

    .theme-toggle:active {
      transform: translateY(1px);
    }

    .theme-toggle i {
      display: block;
      line-height: 1;
    }
  `,
})
export class ThemeToggle {
  readonly theme = inject(ThemeService);
  readonly i18n = inject(I18n);

  readonly label = computed(() =>
    this.i18n.t(this.theme.isDark() ? 'theme.toLight' : 'theme.toDark'),
  );
}
