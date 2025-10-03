import { Icon } from '@iconify/react';
import { type FC, useEffect, useState } from 'react';

import useCurrentTime from '$hooks/useCurrentTime';
import { preferences } from '$utils/config';
import { cn, playPopAudio } from '$utils/helpers/misc';

export interface ClockProps {
  timeZone: string;
  title?: string;
  formatString?: string;
  refreshInterval?: number;
}

const Clock: FC<ClockProps> = ({
  timeZone,
  title = 'Time',
  formatString = preferences.timeFormat,
  refreshInterval = 60000,
}) => {
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const includesSeconds = formatString.includes(':ss') || formatString.includes(':s');

  const format24Hour = includesSeconds ? 'HH:mm:ss' : 'HH:mm';
  const format12Hour = includesSeconds ? 'h:mm:ss a' : 'h:mm a';

  const [currentDisplayFormat, setCurrentDisplayFormat] = useState<string>(() => {
    if (formatString === format24Hour) return format24Hour;
    if (formatString === format12Hour) return format12Hour;

    return formatString.includes('H') ? format24Hour : format12Hour;
  });

  const { currentTime, currentOffset, loading } = useCurrentTime(
    timeZone,
    currentDisplayFormat,
    refreshInterval
  );

  useEffect(() => {
    if (!loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [loading, initialLoadComplete]);

  const toggleFormat = () => {
    setCurrentDisplayFormat((prevFormat) => {
      if (prevFormat === format24Hour) return format12Hour;
      return format24Hour;
    });
  };

  if (loading && !initialLoadComplete) {
    return (
      <div
        className="flex flex-col rounded-md border-2 border-ctp-mauve bg-ctp-mantle p-4 dark:border-ctp-pink"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-row items-center justify-between text-center">
          <h2 className="text-base text-ctp-subtext1">{title}</h2>
        </div>
        <div className="animate-fade-in-up flex flex-col gap-1 md:items-center">
          <p
            className={cn(
              'm-0 p-0 text-2xl font-semibold text-ctp-text md:text-3xl',
              'motion-safe:transition-[color] motion-safe:duration-200'
            )}
          >
            Loading...
          </p>

          <p
            className={cn(
              'm-0 p-0 text-xs text-ctp-subtext0',
              'motion-safe:transition-[color] motion-safe:duration-200'
            )}
          >
            {timeZone} (UTC{currentOffset})
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-md border-2 border-ctp-mauve bg-ctp-mantle p-4 dark:border-ctp-pink">
      <div className="flex flex-row items-center justify-between text-center">
        <h2 className="text-base text-ctp-subtext1">{title}</h2>
        <button
          type="button"
          onClick={() => {
            toggleFormat();
            playPopAudio();
          }}
          className="cursor-pointer border-none bg-transparent p-0"
          title={`Click to toggle the clock to a ${currentDisplayFormat === format24Hour ? '12-hour' : '24-hour'} format.`}
          aria-label={`Toggle time display format. Current format is ${currentDisplayFormat === format24Hour ? '24-hour' : '12-hour'}. Click to switch.`}
          data-umami-event="Clock format toggle"
        >
          <Icon
            icon="mdi:clock-outline"
            fontSize={24}
            aria-hidden={true}
            className="text-ctp-mauve dark:text-ctp-pink"
          />
        </button>
      </div>

      <div
        className={cn(
          'flex flex-col gap-1 md:items-center',
          initialLoadComplete && 'animate-fade-in'
        )}
        role="timer"
        aria-live="polite"
      >
        <p
          className={cn(
            'm-0 p-0 text-2xl font-semibold text-ctp-text md:text-3xl',
            'motion-safe:transition-[color] motion-safe:duration-200'
          )}
        >
          {currentTime}
        </p>

        <p
          className={cn(
            'm-0 p-0 text-xs text-ctp-subtext0',
            'motion-safe:transition-[color] motion-safe:duration-200'
          )}
        >
          {timeZone} (UTC{currentOffset})
        </p>
      </div>
    </div>
  );
};

export default Clock;
