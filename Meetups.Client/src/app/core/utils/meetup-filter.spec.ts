import { describe, expect, it } from 'vitest';
import { Meetup } from '../models/meetup';
import { selectMeetups } from './meetup-filter';

const now = new Date('2026-11-03T12:00:00');

function meetup(overrides: Partial<Meetup> & Pick<Meetup, 'id' | 'name'>): Meetup {
  return {
    id: overrides.id,
    name: overrides.name,
    dateAndTime: overrides.dateAndTime ?? '2026-11-10T18:00:00',
    organizer: overrides.organizer ?? 'Анна',
    address: overrides.address ?? 'Москва',
    description: overrides.description ?? 'Описание',
  };
}

const meetups: Meetup[] = [
  meetup({ id: '1', name: 'Будущая встреча', dateAndTime: '2026-11-10T18:00:00', organizer: 'Анна' }),
  meetup({ id: '2', name: 'Прошедшая встреча', dateAndTime: '2026-10-20T18:00:00', organizer: 'Игорь' }),
  meetup({ id: '3', name: 'Завтрашняя встреча', dateAndTime: '2026-11-04T10:00:00', organizer: 'Мария' }),
  meetup({ id: '4', name: 'Давняя встреча', dateAndTime: '2026-09-01T10:00:00', organizer: 'Анна' }),
];

describe('selectMeetups', () => {
  it('sorts upcoming first, then past by descending date', () => {
    const result = selectMeetups(meetups, {
      text: '',
      filter: 'all',
      sort: 'upcoming-first',
      now,
    });

    expect(result.map((item) => item.id)).toEqual(['3', '1', '2', '4']);
  });

  it('filters upcoming meetups', () => {
    const result = selectMeetups(meetups, {
      text: '',
      filter: 'upcoming',
      sort: 'date-asc',
      now,
    });

    expect(result.map((item) => item.id)).toEqual(['3', '1']);
  });

  it('filters past meetups', () => {
    const result = selectMeetups(meetups, {
      text: '',
      filter: 'past',
      sort: 'date-desc',
      now,
    });

    expect(result.map((item) => item.id)).toEqual(['2', '4']);
  });

  it('searches by name, organizer, address and description case-insensitively', () => {
    expect(
      selectMeetups(meetups, { text: 'игорь', filter: 'all', sort: 'date-asc', now }).map(
        (item) => item.id,
      ),
    ).toEqual(['2']);

    expect(
      selectMeetups(meetups, { text: 'МОСКВА', filter: 'all', sort: 'date-asc', now }).length,
    ).toBe(4);
  });

  it('sorts by name using Russian locale', () => {
    const result = selectMeetups(meetups, {
      text: '',
      filter: 'all',
      sort: 'name',
      now,
    });

    expect(result.map((item) => item.name)).toEqual([
      'Будущая встреча',
      'Давняя встреча',
      'Завтрашняя встреча',
      'Прошедшая встреча',
    ]);
  });

  it('sorts by date ascending and descending', () => {
    expect(
      selectMeetups(meetups, { text: '', filter: 'all', sort: 'date-asc', now }).map(
        (item) => item.id,
      ),
    ).toEqual(['4', '2', '3', '1']);

    expect(
      selectMeetups(meetups, { text: '', filter: 'all', sort: 'date-desc', now }).map(
        (item) => item.id,
      ),
    ).toEqual(['1', '3', '2', '4']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(
      selectMeetups(meetups, { text: 'несуществующая', filter: 'all', sort: 'name', now }),
    ).toEqual([]);
  });
});
