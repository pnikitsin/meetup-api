import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../../core/i18n/i18n';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a class="brand" [class.brand--light]="variant() === 'light'" routerLink="/">
      <span class="brand__mark" aria-hidden="true">
        <i class="bi bi-calendar2-week-fill"></i>
      </span>
      <span class="brand__text">
        <span class="brand__name">Meetups<span class="brand__dot">.</span></span>
        @if (showTagline()) {
          <span class="brand__tagline">{{ i18n.t('app.brandTagline') }}</span>
        }
      </span>
    </a>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      color: var(--app-ink);
      text-decoration: none;
    }

    .brand:hover {
      color: var(--app-ink);
    }

    .brand__mark {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.35rem;
      height: 2.35rem;
      border-radius: 0.75rem;
      background: var(--app-gradient);
      color: #fff;
      font-size: 1.1rem;
      box-shadow: 0 8px 16px -8px rgba(91, 75, 219, 0.8);
    }

    .brand__text {
      display: flex;
      flex-direction: column;
      line-height: 1.05;
    }

    .brand__name {
      font-size: 1.16rem;
      font-weight: 800;
      letter-spacing: -0.04em;
    }

    .brand__dot {
      color: var(--app-primary);
    }

    .brand__tagline {
      margin-top: 0.18rem;
      color: var(--app-muted-2);
      font-size: 0.62rem;
      font-weight: 650;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .brand--light {
      color: #fff;
    }

    .brand--light:hover {
      color: #fff;
    }

    .brand--light .brand__mark {
      border: 1px solid rgba(255, 255, 255, 0.28);
      background: rgba(255, 255, 255, 0.15);
      box-shadow: none;
      backdrop-filter: blur(8px);
    }

    .brand--light .brand__dot {
      color: #e9d5ff;
    }

    .brand--light .brand__tagline {
      color: rgba(255, 255, 255, 0.66);
    }
  `,
})
export class Brand {
  readonly i18n = inject(I18n);
  readonly variant = input<'dark' | 'light'>('dark');
  readonly showTagline = input(true);
}
