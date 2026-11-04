/**
 * Русская плюрализация: plural(5, ['день', 'дня', 'дней']) -> 'дней'.
 */
export function plural(count: number, forms: readonly [string, string, string]): string {
  const absolute = Math.abs(count) % 100;
  const lastDigit = absolute % 10;

  if (absolute > 10 && absolute < 20) {
    return forms[2];
  }

  if (lastDigit > 1 && lastDigit < 5) {
    return forms[1];
  }

  if (lastDigit === 1) {
    return forms[0];
  }

  return forms[2];
}

export function pluralize(count: number, forms: readonly [string, string, string]): string {
  return `${count} ${plural(count, forms)}`;
}
