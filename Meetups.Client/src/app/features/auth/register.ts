import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApi } from '../../core/api/auth-api';
import { parseApiError } from '../../core/api/api-error';
import { Auth } from '../../core/auth/auth';
import { I18n } from '../../core/i18n/i18n';
import { controlErrorMessage, passwordsMatch } from '../../core/utils/form-errors';
import { passwordStrength } from '../../core/utils/password';
import { Toasts } from '../../shared/toast/toast';

type RegisterField = 'username' | 'email' | 'password' | 'confirmPassword';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private readonly authApi = inject(AuthApi);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly toasts = inject(Toasts);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  readonly i18n = inject(I18n);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirmation = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly serverFieldErrors = signal<Record<string, string>>({});

  readonly form = this.formBuilder.group(
    {
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(15),
          Validators.pattern(/^[a-zA-Z0-9_.-]+$/),
        ],
      ],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  private readonly passwordValue = toSignal(this.form.controls.password.valueChanges, {
    initialValue: this.form.controls.password.value,
  });

  readonly strength = computed(() =>
    passwordStrength(this.passwordValue(), this.i18n.language()),
  );

  isInvalid(field: RegisterField): boolean {
    if (field === 'confirmPassword' && this.confirmMismatch()) {
      return true;
    }

    const control = this.form.controls[field];
    return (
      (control.invalid && (control.touched || this.submitted())) ||
      Boolean(this.serverFieldErrors()[field])
    );
  }

  errorFor(field: RegisterField): string {
    if (field === 'confirmPassword' && this.confirmMismatch()) {
      return this.i18n.t('auth.register.mismatch');
    }

    return (
      this.serverFieldErrors()[field] ??
      controlErrorMessage(this.form.controls[field], this.i18n.language())
    );
  }

  confirmMismatch(): boolean {
    const control = this.form.controls.confirmPassword;
    return this.form.hasError('mismatch') && (control.touched || this.submitted());
  }

  clearServerError(field: RegisterField): void {
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

  toggleConfirmation(): void {
    this.showConfirmation.update((value) => !value);
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

    const { username, email, password } = this.form.getRawValue();

    try {
      await firstValueFrom(this.authApi.register({ username, email, password }));

      try {
        const login = await firstValueFrom(this.authApi.login({ email, password }));
        this.auth.establish(login);
        this.toasts.success(this.i18n.t('auth.register.createdWelcome'));
        await this.router.navigateByUrl('/dashboard');
      } catch {
        this.toasts.success(this.i18n.t('auth.register.createdSignIn'));
        await this.router.navigate(['/login'], { queryParams: { email } });
      }
    } catch (error) {
      const failure = parseApiError(error, this.i18n.language());

      if (failure.status === 409) {
        this.serverFieldErrors.set({ email: this.i18n.t('auth.register.emailTaken') });
      } else {
        this.serverError.set(failure.message);
        this.serverFieldErrors.set(failure.fieldErrors);
      }
    } finally {
      this.loading.set(false);
    }
  }
}
