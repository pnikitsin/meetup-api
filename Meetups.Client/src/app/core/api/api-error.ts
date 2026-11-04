import { HttpErrorResponse } from '@angular/common/http';
import { Language } from '../i18n/language';
import { translate, TranslationKey } from '../i18n/translations';

export interface ApiFailure {
  status: number;
  message: string;
  fieldErrors: Record<string, string>;
}

const FIELD_LABELS: Record<string, TranslationKey> = {
  username: 'field.username',
  email: 'field.email',
  password: 'field.password',
  name: 'field.name',
  dateandtime: 'field.dateAndTime',
  organizer: 'field.organizer',
  address: 'field.address',
  description: 'field.description',
};

const MESSAGE_TRANSLATIONS: Record<string, TranslationKey> = {
  'email is taken.': 'api.emailTaken',
  'email is incorrect.': 'api.emailIncorrect',
  'password is incorrect.': 'api.passwordIncorrect',
  'meetup not found.': 'api.meetupNotFound',
  'only the creator can modify this meetup.': 'api.forbiddenMeetup',
};

function translateValidationMessage(
  field: string,
  message: string,
  language: Language,
): string {
  const normalized = message.toLowerCase();
  const fieldKey = FIELD_LABELS[field.toLowerCase()];
  const label = translate(language, fieldKey ?? 'field.generic');

  if (normalized.includes('required')) {
    return `${label}: ${translate(language, 'validation.required')}`;
  }

  if (normalized.includes('email is invalid')) {
    return translate(language, 'validation.email');
  }

  if (normalized.includes('must be between')) {
    if (field.toLowerCase() === 'password') {
      return translate(language, 'validation.passwordLength');
    }

    if (field.toLowerCase() === 'username') {
      return translate(language, 'validation.usernameLength');
    }

    return translate(language, 'validation.invalidLength', { field: label });
  }

  if (normalized.includes('must not exceed')) {
    const match = normalized.match(/(\d+)/);

    return match
      ? translate(language, 'validation.tooLong', { field: label, count: match[1] })
      : translate(language, 'validation.tooLongGeneric', { field: label });
  }

  if (normalized.includes('may only contain')) {
    return translate(language, 'validation.usernameChars');
  }

  return translate(language, 'validation.fieldWithMessage', {
    field: label,
    message,
  });
}

function translateMessage(message: string, language: Language): string {
  const key = MESSAGE_TRANSLATIONS[message.trim().toLowerCase()];
  return key ? translate(language, key) : message.trim();
}

function statusMessage(status: number, language: Language): string {
  switch (status) {
    case 0:
      return translate(language, 'api.network');
    case 400:
      return translate(language, 'api.badRequest');
    case 401:
      return translate(language, 'api.unauthorized');
    case 403:
      return translate(language, 'api.forbidden');
    case 404:
      return translate(language, 'api.notFound');
    case 409:
      return translate(language, 'api.conflict');
    case 500:
      return translate(language, 'api.server');
    default:
      return translate(language, 'api.generic');
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Приводит разные форматы ошибок ASP.NET Core к единому виду:
 * - `{ "error": "..." }` из ErrorHandlerMiddleware;
 * - `ValidationProblemDetails` с `errors` при ошибках модели;
 * - сетевые ошибки и непредвиденные ответы.
 */
export function parseApiError(error: unknown, language: Language = 'ru'): ApiFailure {
  if (!(error instanceof HttpErrorResponse)) {
    return {
      status: 0,
      message: statusMessage(0, language),
      fieldErrors: {},
    };
  }

  const status = error.status;
  const body: unknown = error.error;
  const fieldErrors: Record<string, string> = {};
  let message = '';

  if (typeof body === 'string' && body.trim()) {
    message = body.trim();
  }

  if (isRecord(body)) {
    if (typeof body['error'] === 'string') {
      message = translateMessage(body['error'], language);
    }

    if (isRecord(body['errors'])) {
      for (const [field, value] of Object.entries(body['errors'])) {
        const messages = Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

        if (messages.length > 0) {
          fieldErrors[field.toLowerCase()] = translateValidationMessage(
            field,
            messages[0],
            language,
          );
        }
      }

      if (Object.keys(fieldErrors).length > 0 && !message) {
        message = translate(language, 'validation.checkFields');
      }
    }

    if (!message && typeof body['detail'] === 'string') {
      message = body['detail'];
    }

    if (!message && typeof body['title'] === 'string' && status < 500) {
      message = body['title'];
    }
  }

  if (!message) {
    message = statusMessage(status, language);
  }

  return { status, message, fieldErrors };
}
