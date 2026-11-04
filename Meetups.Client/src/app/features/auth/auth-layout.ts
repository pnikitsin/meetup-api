import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18n } from '../../core/i18n/i18n';
import { Brand } from '../../shared/brand/brand';
import { LanguageSwitcher } from '../../shared/language-switcher/language-switcher';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, Brand, LanguageSwitcher],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {
  readonly i18n = inject(I18n);
  readonly year = new Date().getFullYear();
}
