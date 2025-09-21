import {
  differenceInDays,
  differenceInMilliseconds,
  formatDistanceToNowStrict,
  formatISO,
  isPast,
} from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import { preferences } from '$utils/config';

export type DateFormat = 'full' | 'short' | 'year' | 'iso' | 'offset' | 'relative' | 'time';
export type DateInput = Date | string | number;

const toDate = (date: DateInput): Date => {
  if (date instanceof Date) return date;

  return new Date(date);
};

export const getTimezoneOffset = (date: DateInput, timeZone: string): string => {
  try {
    return formatInTimeZone(toDate(date), timeZone, 'XXX');
  } catch (error) {
    console.error('Error getting timezone offset:', error);
    return 'N/A';
  }
};

export const formatDate = (
  date: DateInput,
  format: DateFormat | string = 'full',
  timeZone: string = preferences.timeZone
): string => {
  try {
    const dateObj = toDate(date);

    switch (format) {
      case 'full': {
        return formatInTimeZone(dateObj, timeZone, preferences.dateFormat);
      }
      case 'short': {
        return formatInTimeZone(dateObj, timeZone, 'MM/dd/yyyy');
      }
      case 'year': {
        return formatInTimeZone(dateObj, timeZone, 'yyyy');
      }
      case 'iso': {
        return formatISO(dateObj, { representation: 'complete' });
      }
      case 'offset': {
        return getTimezoneOffset(dateObj, timeZone);
      }
      case 'time': {
        return formatInTimeZone(dateObj, timeZone, preferences.timeFormat);
      }
      case 'relative': {
        const now = new Date();
        const diffInDays = differenceInDays(now, dateObj);

        const diffInMs = differenceInMilliseconds(now, dateObj);
        if (diffInMs < 60000 && isPast(dateObj)) return 'just now';

        if (diffInDays < 2) return `${formatDistanceToNowStrict(dateObj)} ago`;

        const currentYear = now.getFullYear();
        const dateYear = dateObj.getFullYear();
        if (dateYear === currentYear) return formatInTimeZone(dateObj, timeZone, 'MMMM d');

        return formatInTimeZone(dateObj, timeZone, preferences.dateFormat);
      }
      default: {
        return formatInTimeZone(dateObj, timeZone, format);
      }
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

export const compareDates = (date1: DateInput, date2: DateInput): number => {
  const d1 = toDate(date1).getTime();
  const d2 = toDate(date2).getTime();

  return d1 - d2;
};

export const isOlderThan = (date: DateInput, days: number): boolean => {
  try {
    const dateObj = toDate(date);
    const now = new Date();

    const diffInDays = differenceInDays(now, dateObj);
    return diffInDays > days;
  } catch (error) {
    console.error('Error checking date age:', error);
    return false;
  }
};
