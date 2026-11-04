import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Language } from '../i18n/language';
import { translate } from '../i18n/translations';

export function controlErrorMessage(
  control: AbstractControl | null,
  language: Language = 'ru',
): string {
  if (!control?.errors) {
    return '';
  }

  const errors: ValidationErrors = control.errors;

  if (errors['required']) {
    return translate(language, 'validation.required');
  }

  if (errors['email']) {
    return translate(language, 'validation.email');
  }

  if (errors['minlength']) {
    return translate(language, 'validation.minLength', {
      count: errors['minlength'].requiredLength,
    });
  }

  if (errors['maxlength']) {
    return translate(language, 'validation.maxLength', {
      count: errors['maxlength'].requiredLength,
    });
  }

  if (errors['pattern']) {
    return translate(language, 'validation.pattern');
  }

  if (errors['mismatch']) {
    return translate(language, 'validation.mismatch');
  }

  return translate(language, 'validation.generic');
}

/** Считает строку из одних пробелов пустой. */
export function trimmedRequired(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return typeof value === 'string' && value.trim().length === 0 ? { required: true } : null;
}

export function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmation = group.get('confirmPassword')?.value;

  return password === confirmation ? null : { mismatch: true };
}
