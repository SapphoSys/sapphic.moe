import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

import { formatDate, getTimezoneOffset } from '$utils/helpers/date';

export interface UseCurrentTimeResult {
  currentTime: string;
  currentOffset: string;
  loading: boolean;
}

const formatTimeWithDateFns = (date: Date, timeZone: string, formatString: string): string => {
  try {
    return formatDate(date, formatString, timeZone);
  } catch (error) {
    console.error('Error formatting time:', error);
    if (error instanceof RangeError) {
      return 'Invalid TimeZone/Format';
    }
    return 'Error';
  }
};

const useCurrentTime = (
  timeZone: string,
  formatString = 'HH:mm',
  refreshInterval = 60000
): UseCurrentTimeResult => {
  const [currentTime, setCurrentTime]: [string, Dispatch<SetStateAction<string>>] =
    useState<string>('');
  const [currentOffset, setCurrentOffset]: [string, Dispatch<SetStateAction<string>>] =
    useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId: number | null = null;

    const updateTimeAndOffset = () => {
      const now = new Date();

      setCurrentTime(formatTimeWithDateFns(now, timeZone, formatString));
      setCurrentOffset(getTimezoneOffset(now, timeZone));
      setLoading(false);
    };

    updateTimeAndOffset();

    if (refreshInterval > 0) {
      intervalId = window.setInterval(updateTimeAndOffset, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, [timeZone, formatString, refreshInterval]);

  return { currentTime, currentOffset, loading };
};

export default useCurrentTime;
