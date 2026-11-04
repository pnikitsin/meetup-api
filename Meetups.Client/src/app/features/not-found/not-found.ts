import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../core/auth/auth';
import { I18n } from '../../core/i18n/i18n';
import { Brand } from '../../shared/brand/brand';
import { LanguageSwitcher } from '../../shared/language-switcher/language-switcher';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, Brand, LanguageSwitcher],
  template: `
    <div class="notfound">
      <div class="notfound__inner">
        <div class="notfound__topbar">
          <app-brand />
          <app-language-switcher />
        </div>
        <div class="surface-card notfound__card">
          <div class="notfound__code" aria-hidden="true">404</div>
          <span class="eyebrow">{{ i18n.t('notFound.eyebrow') }}</span>
          <h1>{{ i18n.t('notFound.title') }}</h1>
          <p>{{ i18n.t('notFound.message') }}</p>
          <div class="notfound__actions">
            <a class="btn btn-primary" [routerLink]="homeLink()">
              <i class="bi bi-arrow-left" aria-hidden="true"></i>
              {{ auth.isAuthenticated() ? i18n.t('notFound.home') : i18n.t('notFound.signIn') }}
            </a>
            <button type="button" class="btn btn-outline-secondary" (click)="goBack()">
              {{ i18n.t('common.back') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .notfound {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem;
      background:
        radial-gradient(800px 400px at 15% 0%, rgba(91, 75, 219, 0.12), transparent 60%),
        radial-gradient(700px 360px at 90% 10%, rgba(168, 85, 247, 0.1), transparent 62%),
        var(--app-bg);
    }

    .notfound__inner {
      width: 100%;
      max-width: 34rem;
    }

    .notfound__topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .notfound__card {
      margin-top: 1.5rem;
      padding: 2.2rem;
      text-align: center;
    }

    .notfound__code {
      margin-bottom: 0.7rem;
      background: var(--app-gradient);
      background-clip: text;
      color: transparent;
      font-size: clamp(4rem, 3rem + 4vw, 6rem);
      font-weight: 800;
      letter-spacing: -0.07em;
      line-height: 0.95;
    }

    h1 {
      margin: 0.55rem 0 0;
      font-size: clamp(1.4rem, 1.15rem + 1vw, 1.9rem);
      font-weight: 780;
      letter-spacing: -0.03em;
    }

    p {
      max-width: 24rem;
      margin: 0.6rem auto 0;
      color: var(--app-muted);
      font-size: 0.9rem;
      line-height: 1.6;
    }

    .notfound__actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.6rem;
      margin-top: 1.4rem;
    }

    @media (max-width: 575.98px) {
      .notfound__card {
        padding: 1.5rem;
      }

      .notfound__actions {
        flex-direction: column;

        .btn {
          width: 100%;
        }
      }
    }
  `,
})
export class NotFound {
  readonly auth = inject(Auth);
  readonly i18n = inject(I18n);
  readonly homeLink = computed(() => (this.auth.isAuthenticated() ? '/dashboard' : '/login'));

  goBack(): void {
    window.history.back();
  }
}
