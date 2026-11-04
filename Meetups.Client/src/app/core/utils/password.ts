import { Language } from '../i18n/language';
import { translate, TranslationKey } from '../i18n/translations';

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

/**
 * Не заменяет серверную валидацию (8–100 символов), а помогает пользователю
 * подобрать более надёжный пароль.
 */
export function passwordStrength(
  value: string,
  language: Language = 'ru',
): PasswordStrength {
  if (value.length < 8) {
    return { score: 0, label: translate(language, 'password.tooShort') };
  }

  let score = 1;

  if (value.length >= 12) {
    score += 1;
  }

  if (/[a-zа-я]/.test(value) && /[A-ZА-Я]/.test(value)) {
    score += 1;
  }

  if (/\d/.test(value)) {
    score += 1;
  }

  if (/[^\w\s]/.test(value)) {
    score += 1;
  }

  const clamped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
  const labels: Record<number, TranslationKey> = {
    0: 'password.tooShort',
    1: 'password.weak',
    2: 'password.medium',
    3: 'password.good',
    4: 'password.strong',
  };

  return { score: clamped, label: translate(language, labels[clamped]) };
}
