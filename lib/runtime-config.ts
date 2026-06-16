function readTrimmedPublicValue(name: string): string | null {
  const rawValue = process.env[name]?.trim();
  return rawValue ? rawValue : null;
}

function readPositiveInteger(name: string, fallback: number): number {
  const rawValue = readTrimmedPublicValue(name);

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

export const DEFAULT_CURRENCY_SYMBOL =
  readTrimmedPublicValue('EXPO_PUBLIC_DEFAULT_CURRENCY_SYMBOL') ?? 'S/';

export const AUTH_PASSWORD_MIN_LENGTH = readPositiveInteger(
  'EXPO_PUBLIC_PASSWORD_MIN_LENGTH',
  8,
);

export function formatCurrencyAmount(
  value: number,
  currencySymbol = DEFAULT_CURRENCY_SYMBOL,
): string {
  return `${currencySymbol} ${value.toFixed(2)}`;
}

export function formatCurrencyValue(
  value: number | string | null | undefined,
  currencySymbol = DEFAULT_CURRENCY_SYMBOL,
): string {
  if (typeof value === 'number') {
    return formatCurrencyAmount(value, currencySymbol);
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return formatCurrencyAmount(0, currencySymbol);
    }

    const parsedValue = Number(trimmedValue);

    if (Number.isFinite(parsedValue)) {
      return formatCurrencyAmount(parsedValue, currencySymbol);
    }

    return `${currencySymbol} ${trimmedValue}`;
  }

  return formatCurrencyAmount(0, currencySymbol);
}
