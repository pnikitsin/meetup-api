import { Pipe, PipeTransform } from '@angular/core';
import { plural } from '../../core/utils/plural';

@Pipe({ name: 'plural' })
export class PluralPipe implements PipeTransform {
  transform(count: number, one: string, few: string, many: string): string {
    return `${count} ${plural(count, [one, few, many])}`;
  }
}
