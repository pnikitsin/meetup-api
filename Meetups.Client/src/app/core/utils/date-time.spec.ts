import { describe, expect, it } from 'vitest';
import {
  countdownLabel,
  formatFullDate,
  isPast,
  isUpcoming,
  meetupStatus,
  parseApiDate,
  relativeLabel,
  toApiDateTime,
  toDateTimeLocalValue,
} from './date-time';

describe('parseApiDate', () => {
  it('treats values without timezone as local wall time', () => {
    const parsed = parseApiDate('2026-11-03T18:30:00');

    expect(parsed).not.toBeNull();
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(10);
    expect(parsed?.getDate()).toBe(3);
    expect(parsed?.getHours()).toBe(18);
    expect(parsed?.getMinutes()).toBe(30);
  });

  it('supports space separator from SQL Server', () => {
    const parsed = parseApiDate('2026-11-03 18:30:00');
    expect(parsed?.getHours()).toBe(18);
  });

  it('respects explicit UTC offset', () => {
    const parsed = parseApiDate('2026-11-03T18:30:00Z');
    expect(parsed?.toISOString()).toBe('2026-11-03T18:30:00.000Z');
  });

  it('returns null for empty or invalid values', () => {
    expect(parseApiDate('')).toBeNull();
    expect(parseApiDate(null)).toBeNull();
    expect(parseApiDate('not-a-date')).toBeNull();
  });
});

describe('date-time conversions', () => {
  it('round-trips a datetime-local value', () => {
    const local = toDateTimeLocalValue('2026-11-03T18:30:00');
    expect(local).toBe('2026-11-03T18:30');

    expect(toApiDateTime(local)).toBe('2026-11-03T18:30:00');
  });

  it('keeps seconds when already present', () => {
    expect(toApiDateTime('2026-11-03T18:30:45')).toBe('2026-11-03T18:30:45');
  });
});

describe('meetup status', () => {
  const now = new Date('2026-11-03T12:00:00');

  it('marks past meetups', () => {
    expect(meetupStatus('2026-11-01T10:00:00', now).key).toBe('past');
    expect(isPast('2026-11-01T10:00:00', now)).toBe(true);
    expect(isUpcoming('2026-11-01T10:00:00', now)).toBe(false);
  });

  it('marks today meetups', () => {
    expect(meetupStatus('2026-11-03T20:00:00', now).key).toBe('today');
  });

  it('marks meetups within a week as soon', () => {
    expect(meetupStatus('2026-11-06T10:00:00', now)).toEqual({
      key: 'upcoming',
      label: 'Скоро',
    });
  });

  it('marks distant meetups as planned', () => {
    expect(meetupStatus('2026-12-20T10:00:00', now).label).toBe('Запланирована');
  });
});

describe('relative labels', () => {
  const now = new Date('2026-11-03T12:00:00');

  it('describes near future', () => {
    expect(relativeLabel('2026-11-03T12:30:00', now)).toBe('через 30 минут');
    expect(relativeLabel('2026-11-03T15:00:00', now)).toBe('через 3 часа');
    expect(relativeLabel('2026-11-04T12:00:00', now)).toBe('завтра');
    expect(relativeLabel('2026-11-05T12:00:00', now)).toBe('послезавтра');
  });

  it('describes past', () => {
    expect(relativeLabel('2026-11-02T12:00:00', now)).toBe('вчера');
    expect(relativeLabel('2026-10-29T12:00:00', now)).toBe('5 дней назад');
  });
});

describe('countdownLabel', () => {
  const now = new Date('2026-11-03T12:00:00');

  it('returns started message for past dates', () => {
    expect(countdownLabel('2026-11-03T11:00:00', now)).toBe('Встреча уже началась');
  });

  it('counts days and hours', () => {
    expect(countdownLabel('2026-11-05T18:00:00', now)).toBe('2 дня и 6 часов');
    expect(countdownLabel('2026-11-03T15:00:00', now)).toBe('3 часа');
    expect(countdownLabel('2026-11-03T12:45:00', now)).toBe('45 минут');
  });
});

describe('english formatting', () => {
  const now = new Date('2026-11-03T12:00:00');

  it('formats full dates without russian suffixes', () => {
    expect(formatFullDate('2026-11-03T18:30:00', 'en')).toBe('November 3, 2026');
  });

  it('localizes statuses', () => {
    expect(meetupStatus('2026-11-06T10:00:00', now, 'en').label).toBe('Soon');
    expect(meetupStatus('2026-12-20T10:00:00', now, 'en').label).toBe('Scheduled');
  });

  it('localizes relative labels', () => {
    expect(relativeLabel('2026-11-03T12:30:00', now, 'en')).toBe('in 30 minutes');
    expect(relativeLabel('2026-11-03T15:00:00', now, 'en')).toBe('in 3 hours');
    expect(relativeLabel('2026-11-04T12:00:00', now, 'en')).toBe('tomorrow');
    expect(relativeLabel('2026-10-29T12:00:00', now, 'en')).toBe('5 days ago');
  });

  it('localizes countdown labels', () => {
    expect(countdownLabel('2026-11-03T11:00:00', now, 'en')).toBe(
      'The meetup has already started',
    );
    expect(countdownLabel('2026-11-05T18:00:00', now, 'en')).toBe('2 days and 6 hours');
    expect(countdownLabel('2026-11-03T12:45:00', now, 'en')).toBe('45 minutes');
  });
});
