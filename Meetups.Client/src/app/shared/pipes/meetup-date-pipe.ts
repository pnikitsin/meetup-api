import { inject, Pipe, PipeTransform } from '@angular/core';
import { I18n } from '../../core/i18n/i18n';
import {
  formatDate,
  formatDateTime,
  formatFullDate,
  formatShortDate,
  formatTime,
  formatWeekday,
  formatWeekdayShort,
  toDateTimeLocalValue,
} from '../../core/utils/date-time';

export type MeetupDateFormat =
  | 'day'
  | 'month-short'
  | 'month-long'
  | 'time'
  | 'full'
  | 'short'
  | 'datetime'
  | 'weekday'
  | 'weekday-short'
  | 'input';

@Pipe({ name: 'meetupDate', pure: false })
export class MeetupDatePipe implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform(value: string | Date | null | undefined, format: MeetupDateFormat = 'full'): string {
    const language = this.i18n.language();

    switch (format) {
      case 'day':
        return formatDate(value, { day: 'numeric' }, language);
      case 'month-short':
        return formatDate(value, { month: 'short' }, language);
      case 'month-long':
        return formatDate(value, { month: 'long' }, language);
      case 'time':
        return formatTime(value, language);
      case 'short':
        return formatShortDate(value, language);
      case 'datetime':
        return formatDateTime(value, language);
      case 'weekday':
        return formatWeekday(value, language);
      case 'weekday-short':
        return formatWeekdayShort(value, language);
      case 'input':
        return toDateTimeLocalValue(value);
      case 'full':
      default:
        return formatFullDate(value, language);
    }
  }
}
