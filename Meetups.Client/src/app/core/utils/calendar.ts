import { Meetup } from '../models/meetup';
import { parseApiDate } from './date-time';

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function icsDateLocal(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function icsDateUtc(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

function safeFileName(value: string): string {
  const normalized = value
    .trim()
    .toLocaleLowerCase('ru-RU')
    .replace(/[^a-zа-я0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  return normalized || 'meetup';
}

export function buildCalendarFile(meetup: Meetup): { fileName: string; content: string } {
  const start = parseApiDate(meetup.dateAndTime) ?? new Date();
  const end = new Date(start.getTime() + 90 * 60_000);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Meetups//Meetups Calendar//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${meetup.id}@meetups`,
    `DTSTAMP:${icsDateUtc(new Date())}`,
    `DTSTART:${icsDateLocal(start)}`,
    `DTEND:${icsDateLocal(end)}`,
    `SUMMARY:${escapeIcs(meetup.name)}`,
    `DESCRIPTION:${escapeIcs(meetup.description)}`,
    `LOCATION:${escapeIcs(meetup.address)}`,
    `ORGANIZER;CN=${escapeIcs(meetup.organizer)}:MAILTO:noreply@meetups.local`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return {
    fileName: `${safeFileName(meetup.name)}.ics`,
    content: lines.join('\r\n'),
  };
}

export function downloadCalendarFile(meetup: Meetup): void {
  const { fileName, content } = buildCalendarFile(meetup);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
