import { describe, expect, it } from 'vitest';
import { Meetup } from '../models/meetup';
import { buildCalendarFile } from './calendar';

const meetup: Meetup = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Встреча; разработчиков, тест',
  dateAndTime: '2026-11-10T18:30:00',
  organizer: 'Анна',
  address: 'Москва, ул. Ленина, 1',
  description: 'Первая строка\nВторая строка',
};

describe('buildCalendarFile', () => {
  it('creates a valid ICS envelope with CRLF line endings', () => {
    const { content } = buildCalendarFile(meetup);

    expect(content.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(content.endsWith('END:VCALENDAR')).toBe(true);
    expect(content).toContain('VERSION:2.0');
    expect(content).toContain('BEGIN:VEVENT');
    expect(content).toContain('END:VEVENT');
    expect(content).toContain(`UID:${meetup.id}@meetups`);
  });

  it('uses local wall time without timezone suffix', () => {
    const { content } = buildCalendarFile(meetup);

    expect(content).toContain('DTSTART:20261110T183000');
    expect(content).toContain('DTEND:20261110T200000');
  });

  it('escapes special characters', () => {
    const { content } = buildCalendarFile(meetup);

    expect(content).toContain('SUMMARY:Встреча\\; разработчиков\\, тест');
    expect(content).toContain('DESCRIPTION:Первая строка\\nВторая строка');
    expect(content).toContain('LOCATION:Москва\\, ул. Ленина\\, 1');
  });

  it('builds a safe filename', () => {
    const { fileName } = buildCalendarFile(meetup);
    expect(fileName).toBe('встреча-разработчиков-тест.ics');
  });
});
