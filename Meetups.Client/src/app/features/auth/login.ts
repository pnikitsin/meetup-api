import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApi } from '../../core/api/auth-api';
import { parseApiError } from '../../core/api/api-error';
import { Auth } from '../../core/auth/auth';
import { I18n } from '../../core/i18n/i18n';
import { controlErrorMessage } from '../../core/utils/form-errors';
import { Toasts } from '../../shared/toast/toast';

type LoginField = 'email' | 'password';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly authApi = inject(AuthApi);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toasts = inject(Toasts);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  readonly i18n = inject(I18n);

  readonly expired = this.route.snapshot.queryParamMap.get('reason') === 'expired';
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly showPassword = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly serverFieldErrors = signal<Record<string, string>>({});

  readonly form = this.formBuilder.group({
    email: [
      this.route.snapshot.queryParamMap.get('email') ?? '',
      [Validators.required, Validators.email, Validators.maxLength(100)],
    ],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
  });

  isInvalid(field: LoginField): boolean {
    const control = this.form.controls[field];
    return (
      (control.invalid && (control.touched || this.submitted())) ||
      Boolean(this.serverFieldErrors()[field])
    );
  }

  errorFor(field: LoginField): string {
    return (
      this.serverFieldErrors()[field] ??
      controlErrorMessage(this.form.controls[field], this.i18n.language())
    );
  }

  clearServerError(field: LoginField): void {
    if (this.serverFieldErrors()[field]) {
      const next = { ...this.serverFieldErrors() };
      delete next[field];
      this.serverFieldErrors.set(next);
    }

    this.serverError.set(null);
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  async submit(): Promise<void> {
    this.submitted.set(true);
    this.serverError.set(null);
    this.serverFieldErrors.set({});

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    try {
      const response = await firstValueFrom(this.authApi.login(this.form.getRawValue()));
      this.auth.establish(response);
      this.toasts.success(
        this.i18n.t('auth.login.welcome', { username: response.username }),
      );
      await this.router.navigateByUrl(this.returnUrl());
    } catch (error) {
      const failure = parseApiError(error, this.i18n.language());
      this.serverError.set(
        failure.status === 401
          ? this.i18n.t('auth.login.invalidCredentials')
          : failure.message,
      );
      this.serverFieldErrors.set(failure.fieldErrors);
    } finally {
      this.loading.set(false);
    }
  }

  private returnUrl(): string {
    const value = this.route.snapshot.queryParamMap.get('returnUrl');

    if (value && value.startsWith('/') && !value.startsWith('//')) {
      return value;
    }

    return '/dashboard';
  }
}
