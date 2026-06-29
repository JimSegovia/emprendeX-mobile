export const DNI_LENGTH = 8;

export function sanitizeDniInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, DNI_LENGTH);
}

export function isValidDni(value: string): boolean {
  return /^\d{8}$/.test(value);
}
