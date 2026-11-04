import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoginResponse, Session } from '../models/session';

const STORAGE_KEY = 'meetups.session';

function readStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as Session).username === 'string' &&
      typeof (parsed as Session).accessToken === 'string' &&
      (parsed as Session).accessToken.length > 0
    ) {
      return {
        username: (parsed as Session).username,
        accessToken: (parsed as Session).accessToken,
      };
    }
  } catch {
    // Повреждённое хранилище не должно ломать запуск приложения.
  }

  return null;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly router = inject(Router);
  private readonly sessionState = signal<Session | null>(readStoredSession());

  readonly session = this.sessionState.asReadonly();
  readonly username = computed(() => this.sessionState()?.username ?? null);
  readonly isAuthenticated = computed(() => this.sessionState() !== null);

  establish(response: LoginResponse): void {
    const session: Session = {
      username: response.username,
      accessToken: response.access_token,
    };

    this.sessionState.set(session);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Приватный режим браузера может запрещать запись — сессия останется в памяти.
    }
  }

  token(): string | null {
    return this.sessionState()?.accessToken ?? null;
  }

  clearSession(): void {
    this.sessionState.set(null);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  logout(options: { redirect?: boolean } = {}): void {
    this.clearSession();

    if (options.redirect !== false) {
      void this.router.navigate(['/login']);
    }
  }
}
