import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Auth } from '../core/auth/auth';
import { I18n } from '../core/i18n/i18n';
import { Avatar } from '../shared/avatar/avatar';
import { Brand } from '../shared/brand/brand';
import { LanguageSwitcher } from '../shared/language-switcher/language-switcher';
import { Toasts } from '../shared/toast/toast';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Brand, Avatar, LanguageSwitcher],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  host: {
    '(document:click)': 'closeMenus()',
    '(document:keydown.escape)': 'closeMenus()',
  },
})
export class AppShell {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toasts = inject(Toasts);

  readonly auth = inject(Auth);
  readonly i18n = inject(I18n);
  readonly username = this.auth.username;
  readonly year = new Date().getFullYear();
  readonly navOpen = signal(false);
  readonly userMenuOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.navOpen.set(false);
        this.userMenuOpen.set(false);
      });
  }

  toggleNav(event: MouseEvent): void {
    event.stopPropagation();
    this.navOpen.update((value) => !value);
    this.userMenuOpen.set(false);
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.userMenuOpen.update((value) => !value);
    this.navOpen.set(false);
  }

  closeMenus(): void {
    this.navOpen.set(false);
    this.userMenuOpen.set(false);
  }

  logout(): void {
    this.closeMenus();
    this.auth.logout();
    this.toasts.info(this.i18n.t('app.loggedOut'));
  }
}
