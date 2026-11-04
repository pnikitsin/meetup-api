import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { parseApiError } from './api-error';

function httpError(status: number, body: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: body });
}

describe('parseApiError', () => {
  it('reads the { error } envelope from ErrorHandlerMiddleware', () => {
    const failure = parseApiError(httpError(409, { error: 'Email is taken.' }));

    expect(failure.status).toBe(409);
    expect(failure.message).toBe('Этот email уже зарегистрирован.');
    expect(failure.fieldErrors).toEqual({});
  });

  it('parses ValidationProblemDetails field errors', () => {
    const failure = parseApiError(
      httpError(400, {
        title: 'One or more validation errors occurred.',
        errors: {
          Email: ['Email is invalid.'],
          Password: ['Password must be between 8 and 100 characters.'],
        },
      }),
    );

    expect(failure.fieldErrors['email']).toBe('Укажите корректный email.');
    expect(failure.fieldErrors['password']).toBe(
      'Пароль должен содержать от 8 до 100 символов.',
    );
    expect(failure.message).toBe('Проверьте правильность заполнения полей.');
  });

  it('falls back to a status-based message', () => {
    const failure = parseApiError(httpError(500, null));
    expect(failure.message).toContain('На сервере произошла ошибка');
  });

  it('handles network errors', () => {
    const failure = parseApiError(new HttpErrorResponse({ status: 0 }));
    expect(failure.status).toBe(0);
    expect(failure.message).toContain('Не удалось связаться с сервером');
  });

  it('handles non-HTTP errors', () => {
    const failure = parseApiError(new Error('boom'));
    expect(failure.status).toBe(0);
    expect(failure.message).toContain('Не удалось связаться с сервером');
  });

  it('localizes messages in english', () => {
    const conflict = parseApiError(httpError(409, { error: 'Email is taken.' }), 'en');
    expect(conflict.message).toBe('This email is already registered.');

    const validation = parseApiError(
      httpError(400, {
        title: 'One or more validation errors occurred.',
        errors: {
          Email: ['Email is invalid.'],
          Password: ['Password must be between 8 and 100 characters.'],
        },
      }),
      'en',
    );

    expect(validation.fieldErrors['email']).toBe('Enter a valid email address.');
    expect(validation.fieldErrors['password']).toBe(
      'Password must be between 8 and 100 characters.',
    );
    expect(validation.message).toBe('Please check the form fields.');

    const server = parseApiError(httpError(500, null), 'en');
    expect(server.message).toContain('Something went wrong on the server');
  });
});
