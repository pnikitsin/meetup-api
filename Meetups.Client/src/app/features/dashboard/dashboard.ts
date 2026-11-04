import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MeetupApi } from '../../core/api/meetup-api';
import { parseApiError } from '../../core/api/api-error';
import { Auth } from '../../core/auth/auth';
import { Clock } from '../../core/clock';
import { I18n } from '../../core/i18n/i18n';
import { Meetup } from '../../core/models/meetup';
import { downloadCalendarFile } from '../../core/utils/calendar';
import {
  countdownLabel,
  formatFullDate,
  formatWeekday,
  isThisWeek,
  isUpcoming,
  meetupStatus,
  parseApiDate,
} from '../../core/utils/date-time';
import { Avatar } from '../../shared/avatar/avatar';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { MeetupDatePipe } from '../../shared/pipes/meetup-date-pipe';
import { Toasts } from '../../shared/toast/toast';

interface DashboardStat {
  label: string;
  value: number;
  hint: string;
  icon: string;
  tone: 'indigo' | 'violet' | 'green' | 'amber';
}

interface OrganizerStat {
  name: string;
  count: number;
  percent: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, Avatar, EmptyState, MeetupDatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly meetupApi = inject(MeetupApi);
  private readonly auth = inject(Auth);
  private readonly clock = inject(Clock);
  private readonly toasts = inject(Toasts);

  readonly i18n = inject(I18n);
  readonly username = this.auth.username;
  readonly now = this.clock.now;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly meetups = signal<Meetup[]>([]);

  readonly upcoming = computed(() =>
    this.meetups()
      .filter((meetup) => isUpcoming(meetup.dateAndTime, this.now()))
      .sort(
        (left, right) =>
          (parseApiDate(left.dateAndTime)?.getTime() ?? 0) -
          (parseApiDate(right.dateAndTime)?.getTime() ?? 0),
      ),
  );

  readonly upcomingPreview = computed(() => this.upcoming().slice(0, 4));
  readonly nextMeetup = computed(() => this.upcoming()[0] ?? null);
  readonly nextStatus = computed(() => {
    const meetup = this.nextMeetup();
    return meetup
      ? meetupStatus(meetup.dateAndTime, this.now(), this.i18n.language())
      : null;
  });
  readonly countdown = computed(() => {
    const meetup = this.nextMeetup();
    return meetup
      ? countdownLabel(meetup.dateAndTime, this.now(), this.i18n.language())
      : '';
  });

  readonly past = computed(() =>
    this.meetups()
      .filter((meetup) => !isUpcoming(meetup.dateAndTime, this.now()))
      .sort(
        (left, right) =>
          (parseApiDate(right.dateAndTime)?.getTime() ?? 0) -
          (parseApiDate(left.dateAndTime)?.getTime() ?? 0),
      ),
  );

  readonly lastPast = computed(() => this.past()[0] ?? null);

  readonly organizers = computed<OrganizerStat[]>(() => {
    const counts = new Map<string, number>();

    const withoutOrganizer = this.i18n.t('dashboard.withoutOrganizer');

    for (const meetup of this.meetups()) {
      const name = meetup.organizer.trim() || withoutOrganizer;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    const entries = [...counts.entries()].sort(
      (left, right) =>
        right[1] - left[1] ||
        left[0].localeCompare(right[0], this.i18n.locale()),
    );
    const max = entries[0]?.[1] ?? 1;

    return entries.slice(0, 5).map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / max) * 100),
    }));
  });

  readonly organizerCount = computed(() => {
    const withoutOrganizer = this.i18n.t('dashboard.withoutOrganizer');
    const names = new Set(
      this.meetups().map((meetup) => meetup.organizer.trim() || withoutOrganizer),
    );
    return names.size;
  });

  readonly thisWeekCount = computed(() =>
    this.meetups().filter((meetup) => isThisWeek(meetup.dateAndTime, this.now())).length,
  );

  readonly stats = computed<DashboardStat[]>(() => [
    {
      label: this.i18n.t('dashboard.stat.total'),
      value: this.meetups().length,
      hint:
        this.meetups().length === 0
          ? this.i18n.t('dashboard.stat.total.empty')
          : this.i18n.t('dashboard.stat.total.hint'),
      icon: 'bi-calendar2-week',
      tone: 'indigo',
    },
    {
      label: this.i18n.t('dashboard.stat.upcoming'),
      value: this.upcoming().length,
      hint:
        this.upcoming().length === 0
          ? this.i18n.t('dashboard.stat.upcoming.empty')
          : this.i18n.t('dashboard.stat.upcoming.hint'),
      icon: 'bi-hourglass-split',
      tone: 'violet',
    },
    {
      label: this.i18n.t('dashboard.stat.week'),
      value: this.thisWeekCount(),
      hint: this.i18n.t('dashboard.stat.week.hint'),
      icon: 'bi-calendar-check',
      tone: 'green',
    },
    {
      label: this.i18n.t('dashboard.stat.organizers'),
      value: this.organizerCount(),
      hint:
        this.organizerCount() === 0
          ? this.i18n.t('dashboard.stat.organizers.empty')
          : this.i18n.t('dashboard.stat.organizers.hint'),
      icon: 'bi-people',
      tone: 'amber',
    },
  ]);

  readonly greeting = computed(() => {
    const hour = this.now().getHours();

    if (hour < 5) {
      return this.i18n.t('dashboard.greeting.night');
    }

    if (hour < 12) {
      return this.i18n.t('dashboard.greeting.morning');
    }

    if (hour < 18) {
      return this.i18n.t('dashboard.greeting.day');
    }

    return this.i18n.t('dashboard.greeting.evening');
  });

  readonly todayLabel = computed(() => {
    const language = this.i18n.language();
    return `${formatFullDate(this.now(), language)}, ${formatWeekday(this.now(), language)}`;
  });

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      this.meetups.set(await firstValueFrom(this.meetupApi.getAll()));
    } catch (error) {
      this.error.set(parseApiError(error, this.i18n.language()).message);
    } finally {
      this.loading.set(false);
    }
  }

  downloadCalendar(meetup: Meetup): void {
    downloadCalendarFile(meetup);
    this.toasts.success(this.i18n.t('detail.calendarDownloaded'), {
      title: this.i18n.t('detail.calendarToastTitle'),
    });
  }
}
