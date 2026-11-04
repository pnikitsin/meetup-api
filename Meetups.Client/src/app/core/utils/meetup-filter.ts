import { Meetup } from '../models/meetup';
import { parseApiDate } from './date-time';

export type MeetupFilter = 'all' | 'upcoming' | 'past';
export type MeetupSort = 'upcoming-first' | 'date-asc' | 'date-desc' | 'name';

export interface MeetupQuery {
  text: string;
  filter: MeetupFilter;
  sort: MeetupSort;
  now: Date;
  locale?: string;
}

function timestamp(meetup: Meetup): number {
  return parseApiDate(meetup.dateAndTime)?.getTime() ?? 0;
}

function matchesText(meetup: Meetup, query: string, locale: string): boolean {
  if (!query) {
    return true;
  }

  const haystack = [meetup.name, meetup.organizer, meetup.address, meetup.description]
    .join(' ')
    .toLocaleLowerCase(locale);

  return haystack.includes(query);
}

function compareByName(left: Meetup, right: Meetup, locale: string): number {
  return left.name.localeCompare(right.name, locale, { sensitivity: 'base' });
}

function isUpcoming(meetup: Meetup, now: Date): boolean {
  return timestamp(meetup) >= now.getTime();
}

/**
 * Чистая функция поиска/фильтрации/сортировки — её легко покрыть тестами
 * и переиспользовать на разных экранах.
 */
export function selectMeetups(meetups: readonly Meetup[], query: MeetupQuery): Meetup[] {
  const locale = query.locale ?? 'ru-RU';
  const normalizedQuery = query.text.trim().toLocaleLowerCase(locale);

  const filtered = meetups.filter((meetup) => {
    if (!matchesText(meetup, normalizedQuery, locale)) {
      return false;
    }

    if (query.filter === 'upcoming') {
      return isUpcoming(meetup, query.now);
    }

    if (query.filter === 'past') {
      return !isUpcoming(meetup, query.now);
    }

    return true;
  });

  switch (query.sort) {
    case 'date-asc':
      return filtered.sort((left, right) => timestamp(left) - timestamp(right));

    case 'date-desc':
      return filtered.sort((left, right) => timestamp(right) - timestamp(left));

    case 'name':
      return filtered.sort((left, right) => compareByName(left, right, locale));

    case 'upcoming-first':
    default: {
      const upcoming = filtered
        .filter((meetup) => isUpcoming(meetup, query.now))
        .sort((left, right) => timestamp(left) - timestamp(right));
      const past = filtered
        .filter((meetup) => !isUpcoming(meetup, query.now))
        .sort((left, right) => timestamp(right) - timestamp(left));

      return [...upcoming, ...past];
    }
  }
}
