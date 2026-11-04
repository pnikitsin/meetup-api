import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MeetupApi } from '../../../core/api/meetup-api';
import { parseApiError } from '../../../core/api/api-error';
import { Clock } from '../../../core/clock';
import { I18n } from '../../../core/i18n/i18n';
import { Meetup } from '../../../core/models/meetup';
import { downloadCalendarFile } from '../../../core/utils/calendar';
import {
  countdownLabel,
  formatDateTime,
  meetupStatus,
  relativeLabel,
} from '../../../core/utils/date-time';
import { Avatar } from '../../../shared/avatar/avatar';
import { ConfirmDialog } from '../../../shared/confirm/confirm';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { MeetupDatePipe } from '../../../shared/pipes/meetup-date-pipe';
import { Toasts } from '../../../shared/toast/toast';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-meetup-detail',
  standalone: true,
  imports: [RouterLink, Avatar, EmptyState, MeetupDatePipe],
  templateUrl: './meetup-detail.html',
  styleUrl: './meetup-detail.scss',
})
export class MeetupDetail {
  private readonly meetupApi = inject(MeetupApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clock = inject(Clock);
  private readonly confirmDialog = inject(ConfirmDialog);
  private readonly toasts = inject(Toasts);

  readonly i18n = inject(I18n);
  readonly id = this.route.snapshot.paramMap.get('id') ?? '';
  readonly now = this.clock.now;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly deleting = signal(false);
  readonly meetup = signal<Meetup | null>(null);

  readonly status = computed(() => {
    const meetup = this.meetup();
    return meetup
      ? meetupStatus(meetup.dateAndTime, this.now(), this.i18n.language())
      : null;
  });

  readonly relative = computed(() => {
    const meetup = this.meetup();
    return meetup
      ? relativeLabel(meetup.dateAndTime, this.now(), this.i18n.language())
      : '';
  });

  readonly countdown = computed(() => {
    const meetup = this.meetup();

    if (!meetup) {
      return '';
    }

    if (this.status()?.key === 'past') {
      return this.i18n.t('countdown.past');
    }

    return countdownLabel(meetup.dateAndTime, this.now(), this.i18n.language());
  });

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    if (!this.id) {
      this.loading.set(false);
      this.notFound.set(true);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.notFound.set(false);

    try {
      this.meetup.set(await firstValueFrom(this.meetupApi.getById(this.id)));
    } catch (error) {
      const failure = parseApiError(error, this.i18n.language());

      if (failure.status === 404) {
        this.notFound.set(true);
      } else {
        this.error.set(failure.message);
      }
    } finally {
      this.loading.set(false);
    }
  }

  downloadCalendar(): void {
    const meetup = this.meetup();

    if (!meetup) {
      return;
    }

    downloadCalendarFile(meetup);
    this.toasts.success(this.i18n.t('detail.calendarDownloaded'), {
      title: this.i18n.t('detail.calendarToastTitle'),
    });
  }

  async share(): Promise<void> {
    const meetup = this.meetup();

    if (!meetup) {
      return;
    }

    const shareData = {
      title: meetup.name,
      text: `${meetup.name} — ${formatDateTime(meetup.dateAndTime, this.i18n.language())}`,
      url: window.location.href,
    };

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share(shareData);
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        this.toasts.success(this.i18n.t('detail.shareCopied'));
        return;
      }

      this.toasts.error(this.i18n.t('detail.shareUnsupported'));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      this.toasts.error(this.i18n.t('detail.shareFailed'));
    }
  }

  async remove(): Promise<void> {
    const meetup = this.meetup();

    if (!meetup) {
      return;
    }

    const confirmed = await this.confirmDialog.ask({
      title: this.i18n.t('meetups.deleteConfirm.title'),
      message: this.i18n.t('meetups.deleteConfirm.message', { name: meetup.name }),
      confirmLabel: this.i18n.t('meetups.deleteConfirm.confirm'),
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    this.deleting.set(true);

    try {
      await firstValueFrom(this.meetupApi.delete(meetup.id));
      this.toasts.success(this.i18n.t('meetups.deleted'));
      await this.router.navigate(['/meetups']);
    } catch (error) {
      this.toasts.error(parseApiError(error, this.i18n.language()).message);
    } finally {
      this.deleting.set(false);
    }
  }
}
