export const MIN_AGE = 13;
export const MAX_AGE = 120;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidDateOfBirth(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;
  if (date.toISOString().slice(0, 10) !== value) return false;
  return date.getTime() <= Date.now();
}

export function ageInYears(dateOfBirth: string): number {
  const birth = new Date(`${dateOfBirth}T00:00:00Z`);
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - birth.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getUTCDate() < birth.getUTCDate())
  ) {
    age -= 1;
  }
  return age;
}

function shiftYears(years: number): string {
  const now = new Date();
  const date = new Date(
    Date.UTC(now.getUTCFullYear() - years, now.getUTCMonth(), now.getUTCDate())
  );
  return date.toISOString().slice(0, 10);
}

/** Latest allowed date of birth, i.e. the date the student turns MIN_AGE. */
export function maxDateOfBirth(): string {
  return shiftYears(MIN_AGE);
}

/** Earliest allowed date of birth, i.e. the date the student turns MAX_AGE. */
export function minDateOfBirth(): string {
  return shiftYears(MAX_AGE);
}
