import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MeetupApi } from '../../../core/api/meetup-api';
import { parseApiError } from '../../../core/api/api-error';
import { Clock } from '../../../core/clock';
import { I18n } from '../../../core/i18n/i18n';
import { Meetup, MeetupStatus } from '../../../core/models/meetup';
import { isUpcoming, meetupStatus, relativeLabel } from '../../../core/utils/date-time';
import { MeetupFilter, MeetupSort, selectMeetups } from '../../../core/utils/meetup-filter';
import { Avatar } from '../../../shared/avatar/avatar';
import { ConfirmDialog } from '../../../shared/confirm/confirm';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { MeetupDatePipe } from '../../../shared/pipes/meetup-date-pipe';
import { Toasts } from '../../../shared/toast/toast';

type ViewMode = 'grid' | 'list';

const VIEW_STORAGE_KEY = 'meetups.view';

function readViewMode(): ViewMode {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
}

@Component({
  selector: 'app-meetup-list',
  standalone: true,
  imports: [RouterLink, Avatar, EmptyState, MeetupDatePipe],
  templateUrl: './meetup-list.html',
  styleUrl: './meetup-list.scss',
})
export class MeetupList {
  private readonly meetupApi = inject(MeetupApi);
  private readonly clock = inject(Clock);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmDialog = inject(ConfirmDialog);
  private readonly toasts = inject(Toasts);

  readonly i18n = inject(I18n);
  readonly now = this.clock.now;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly meetups = signal<Meetup[]>([]);
  readonly query = signal('');
  readonly filter = signal<MeetupFilter>('all');
  readonly sort = signal<MeetupSort>('upcoming-first');
  readonly view = signal<ViewMode>(readViewMode());
  readonly deletingId = signal<string | null>(null);

  readonly filters = computed<ReadonlyArray<{ value: MeetupFilter; label: string }>>(
    () => [
      { value: 'all', label: this.i18n.t('meetups.filter.all') },
      { value: 'upcoming', label: this.i18n.t('meetups.filter.upcoming') },
      { value: 'past', label: this.i18n.t('meetups.filter.past') },
    ],
  );

  readonly sortOptions = computed<ReadonlyArray<{ value: MeetupSort; label: string }>>(
    () => [
      { value: 'upcoming-first', label: this.i18n.t('meetups.sort.upcomingFirst') },
      { value: 'date-desc', label: this.i18n.t('meetups.sort.dateDesc') },
      { value: 'date-asc', label: this.i18n.t('meetups.sort.dateAsc') },
      { value: 'name', label: this.i18n.t('meetups.sort.name') },
    ],
  );

  readonly counts = computed(() => {
    const now = this.now();
    return {
      all: this.meetups().length,
      upcoming: this.meetups().filter((meetup) => isUpcoming(meetup.dateAndTime, now)).length,
      past: this.meetups().filter((meetup) => !isUpcoming(meetup.dateAndTime, now)).length,
    };
  });

  readonly visible = computed(() =>
    selectMeetups(this.meetups(), {
      text: this.query(),
      filter: this.filter(),
      sort: this.sort(),
      now: this.now(),
      locale: this.i18n.locale(),
    }),
  );

  readonly hasActiveFilters = computed(
    () => this.query().trim().length > 0 || this.filter() !== 'all',
  );

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const value = params.get('filter');
      const next: MeetupFilter = value === 'upcoming' || value === 'past' ? value : 'all';

      if (next !== this.filter()) {
        this.filter.set(next);
      }
    });

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

  setFilter(filter: MeetupFilter): void {
    this.filter.set(filter);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { filter: filter === 'all' ? null : filter },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  setSort(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value as MeetupSort);
  }

  setView(view: ViewMode): void {
    this.view.set(view);

    try {
      localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch {
      // ignore
    }
  }

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.query.set('');
  }

  resetFilters(): void {
    this.query.set('');
    this.setFilter('all');
  }

  statusOf(meetup: Meetup): MeetupStatus {
    return meetupStatus(meetup.dateAndTime, this.now(), this.i18n.language());
  }

  relativeOf(meetup: Meetup): string {
    return relativeLabel(meetup.dateAndTime, this.now(), this.i18n.language());
  }

  async remove(meetup: Meetup): Promise<void> {
    const confirmed = await this.confirmDialog.ask({
      title: this.i18n.t('meetups.deleteConfirm.title'),
      message: this.i18n.t('meetups.deleteConfirm.message', { name: meetup.name }),
      confirmLabel: this.i18n.t('meetups.deleteConfirm.confirm'),
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    this.deletingId.set(meetup.id);

    try {
      await firstValueFrom(this.meetupApi.delete(meetup.id));
      this.meetups.update((items) => items.filter((item) => item.id !== meetup.id));
      this.toasts.success(this.i18n.t('meetups.deleted'));
    } catch (error) {
      this.toasts.error(parseApiError(error, this.i18n.language()).message);
    } finally {
      this.deletingId.set(null);
    }
  }
}
