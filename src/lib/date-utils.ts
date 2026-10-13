import { format, isToday, isTomorrow, isPast, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

export function formatDate(dateString?: string | null, formatStr: string = 'MMM d, yyyy'): string {
  if (!dateString) return 'No date';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, formatStr);
  } catch {
    return dateString;
  }
}

export function formatRelativeDate(dateString?: string | null): string {
  if (!dateString) return 'No deadline';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return `Overdue (${format(date, 'MMM d')})`;
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

export function isDateToday(dateString?: string | null): boolean {
  if (!dateString) return false;
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return isToday(date);
  } catch {
    return false;
  }
}

export function isDatePast(dateString?: string | null): boolean {
  if (!dateString) return false;
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return isPast(date) && !isToday(date);
  } catch {
    return false;
  }
}

export function isDateInCurrentWeek(dateString?: string | null, weekStartsOnMonday: boolean = true): boolean {
  if (!dateString) return false;
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: weekStartsOnMonday ? 1 : 0 });
    const end = endOfWeek(now, { weekStartsOn: weekStartsOnMonday ? 1 : 0 });
    return isWithinInterval(date, { start, end });
  } catch {
    return false;
  }
}
