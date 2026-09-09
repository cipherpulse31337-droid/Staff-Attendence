/**
 * Date and time helper utilities
 */

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatReadableDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatCurrentDisplayDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getCurrentTimeString(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function getCurrentTime24(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Checks if a given time is after the late threshold time (e.g. "09:15")
 * time24 format: "HH:mm" (24-hour)
 */
export function isTimeLate(currentTime24: string, lateThreshold24: string): boolean {
  if (!currentTime24 || !lateThreshold24) return false;
  return currentTime24 > lateThreshold24;
}

/**
 * Checks if a date falls between startDate and endDate inclusive (YYYY-MM-DD)
 */
export function isDateInRange(targetDate: string, startDate: string, endDate: string): boolean {
  if (!targetDate || !startDate || !endDate) return false;
  return targetDate >= startDate && targetDate <= endDate;
}

/**
 * Checks if targetDate is strictly before today (a past day)
 */
export function isPastDate(targetDate: string): boolean {
  const today = getTodayDateString();
  return targetDate < today;
}
