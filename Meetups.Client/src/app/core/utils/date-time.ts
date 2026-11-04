import { Language, localeFor } from '../i18n/language';
import { formatCount, translate } from '../i18n/translations';
import { MeetupStatus } from '../models/meetup';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatter(
  options: Intl.DateTimeFormatOptions,
  language: Language,
): Intl.DateTimeFormat {
  const locale = localeFor(language);
  const key = `${locale}:${JSON.stringify(options)}`;
  let cached = formatterCache.get(key);

  if (!cached) {
    cached = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(key, cached);
  }

  return cached;
}

/**
 * Backend отдаёт DateTime без timezone (Kind=Unspecified).
 * Такое значение нужно трактовать как локальное «настенное» время,
 * а не как UTC. Строки с явным offset/Z парсим как есть.
 */
export function parseApiDate(value: string | Date | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const hasTimezone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(normalized);
  const candidate = hasTimezone ? normalized : normalized.replace(' ', 'T');
  const parsed = new Date(candidate);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toDateTimeLocalValue(value: string | Date | null | undefined): string {
  const date = parseApiDate(value);

  if (!date) {
    return '';
  }

  const pad = (part: number) => part.toString().padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * datetime-local не содержит timezone. Отправляем его как есть,
 * добавляя секунды: ASP.NET Core сохранит ровно то время, которое видел пользователь.
 */
export function toApiDateTime(localValue: string): string {
  const value = localValue.trim();

  if (!value) {
    return '';
  }

  return value.length === 16 ? `${value}:00` : value;
}

export function formatDate(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions,
  language: Language = 'ru',
): string {
  const date = parseApiDate(value);
  return date ? formatter(options, language).format(date) : '';
}

export function formatFullDate(
  value: string | Date | null | undefined,
  language: Language = 'ru',
): string {
  const formatted = formatDate(
    value,
    { day: 'numeric', month: 'long', year: 'numeric' },
    language,
  );

  return language === 'ru' ? formatted.replace(' г.', '') : formatted;
}

export function formatShortDate(
  value: string | Date | null | undefined,
  language: Language = 'ru',
): string {
  return formatDate(value, { day: 'numeric', month: 'short' }, language);
}

export function formatTime(
  value: string | Date | null | undefined,
  language: Language = 'ru',
): string {
  return formatDate(value, { hour: '2-digit', minute: '2-digit' }, language);
}

export function formatWeekday(
  value: string | Date | null | undefined,
  language: Language = 'ru',
): string {
  return formatDate(value, { weekday: 'long' }, language);
}

export function formatWeekdayShort(
  value: string | Date | null | undefined,
  language: Language = 'ru',
): string {
  return formatDate(value, { weekday: 'short' }, language);
}

export function formatDateTime(
  value: string | Date | null | undefined,
  language: Language = 'ru',
): string {
  return `${formatShortDate(value, language)}, ${formatTime(value, language)}`;
}

export function startOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

/** Понедельник — начало недели. */
export function startOfWeek(value: Date): Date {
  const date = startOfDay(value);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return date;
}

export function endOfWeek(value: Date): Date {
  const date = startOfWeek(value);
  date.setDate(date.getDate() + 6);
  return endOfDay(date);
}

export function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function isUpcoming(value: string | Date | null | undefined, now: Date = new Date()): boolean {
  const date = parseApiDate(value);
  return date !== null && date.getTime() >= now.getTime();
}

export function isPast(value: string | Date | null | undefined, now: Date = new Date()): boolean {
  const date = parseApiDate(value);
  return date !== null && date.getTime() < now.getTime();
}

export function isThisWeek(value: string | Date | null | undefined, now: Date): boolean {
  const date = parseApiDate(value);

  if (!date) {
    return false;
  }

  return date.getTime() >= startOfWeek(now).getTime() && date.getTime() <= endOfWeek(now).getTime();
}

export function daysUntil(value: string | Date | null | undefined, now: Date): number {
  const date = parseApiDate(value);

  if (!date) {
    return 0;
  }

  return Math.ceil((date.getTime() - now.getTime()) / DAY);
}

export function meetupStatus(
  value: string | Date | null | undefined,
  now: Date,
  language: Language = 'ru',
): MeetupStatus {
  const date = parseApiDate(value);

  if (!date || date.getTime() < now.getTime()) {
    return { key: 'past', label: translate(language, 'status.past') };
  }

  if (isSameDay(date, now)) {
    return { key: 'today', label: translate(language, 'status.today') };
  }

  if (date.getTime() - now.getTime() <= 7 * DAY) {
    return { key: 'upcoming', label: translate(language, 'status.soon') };
  }

  return { key: 'upcoming', label: translate(language, 'status.planned') };
}

export function relativeLabel(
  value: string | Date | null | undefined,
  now: Date,
  language: Language = 'ru',
): string {
  const date = parseApiDate(value);

  if (!date) {
    return '';
  }

  const diff = date.getTime() - now.getTime();

  if (diff < 0) {
    const days = Math.floor(-diff / DAY);

    if (days === 0) {
      return translate(language, 'relative.today');
    }

    if (days === 1) {
      return translate(language, 'relative.yesterday');
    }

    if (days < 30) {
      return translate(language, 'relative.durationAgo', {
        duration: formatCount(language, days, 'day'),
      });
    }

    return formatShortDate(date, language);
  }

  if (diff < HOUR) {
    const minutes = Math.max(1, Math.round(diff / MINUTE));
    return translate(language, 'relative.inDuration', {
      duration: formatCount(language, minutes, 'minuteAccusative'),
    });
  }

  if (diff < DAY) {
    const hours = Math.max(1, Math.round(diff / HOUR));
    return translate(language, 'relative.inDuration', {
      duration: formatCount(language, hours, 'hour'),
    });
  }

  const days = Math.ceil(diff / DAY);

  if (days === 1) {
    return translate(language, 'relative.tomorrow');
  }

  if (days === 2) {
    return translate(language, 'relative.dayAfterTomorrow');
  }

  if (days <= 14) {
    return translate(language, 'relative.inDuration', {
      duration: formatCount(language, days, 'day'),
    });
  }

  return formatShortDate(date, language);
}

export function countdownLabel(
  value: string | Date | null | undefined,
  now: Date,
  language: Language = 'ru',
): string {
  const date = parseApiDate(value);

  if (!date) {
    return '';
  }

  const diff = date.getTime() - now.getTime();

  if (diff <= 0) {
    return translate(language, 'countdown.started');
  }

  const totalHours = Math.floor(diff / HOUR);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0) {
    const dayLabel = formatCount(language, days, 'day');

    return hours > 0
      ? translate(language, 'countdown.daysHours', {
          days: dayLabel,
          hours: formatCount(language, hours, 'hour'),
        })
      : dayLabel;
  }

  if (totalHours > 0) {
    return formatCount(language, totalHours, 'hour');
  }

  const minutes = Math.max(1, Math.floor(diff / MINUTE));
  return formatCount(language, minutes, 'minute');
}
