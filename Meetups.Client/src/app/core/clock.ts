import { DestroyRef, inject, Injectable, signal } from '@angular/core';

/**
 * Единый источник «текущего времени» для статусов встреч и обратного отсчёта.
 * Обновляется раз в 30 секунд, чтобы интерфейс оставался актуальным без перезагрузки.
 */
@Injectable({ providedIn: 'root' })
export class Clock {
  private readonly destroyRef = inject(DestroyRef);
  private readonly nowState = signal(new Date());

  readonly now = this.nowState.asReadonly();

  constructor() {
    const timer = setInterval(() => this.nowState.set(new Date()), 30_000);
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }
}
